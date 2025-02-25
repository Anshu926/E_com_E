const express = require('express');
const app = express();
const connect_db = require('./db_connect');
const Product_Model = require('./models/product_schema');
const User_Model = require('./models/user_schema');
const Review_model = require('./models/review_schema');
const Order_Model = require('./models/order_schema'); // Import your Order model
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo');

const compression = require('compression');
app.use(compression());


// Example in Express
app.use(express.static('public', {
    maxAge: '1d'  // Cache static files for 1 day
}));


connect_db();

app.set('view engine', 'ejs');
app.set('views', 'views');
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
const methodOverride = require('method-override');
const Review_Model = require('./models/review_schema');
app.use(methodOverride('_method'));

app.use(session({
    secret:'flashblog',
    saveUninitialized: true,
    resave: true, 
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://e_com_web:2005@cluster0.6hhoa.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0', 
        collectionName: 'sessions', // Name of the collection storing sessions
        ttl: 24 * 60 * 60, // 24 hours (time-to-live in seconds)
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        httpOnly: true, // Helps prevent XSS attacks
        secure: false // Set to true if using HTTPS
    } 
}));

app.use(flash());  

app.use(passport.initialize());
app.use(passport.session());


// Use Email Instead of Username for Passport Strategy
passport.use(new LocalStrategy(
    { usernameField: 'email' }, // Specify that email should be used instead of username
    User_Model.authenticate()
));
passport.serializeUser(User_Model.serializeUser());
passport.deserializeUser(User_Model.deserializeUser());


app.use((req, res, next) => {
    res.locals.success_message = req.flash('success');
    res.locals.error_message = req.flash('error');
    res.locals.current_user = req.user; // Add the user object to res.locals
    next();
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // User is authenticated, proceed to the next middleware/route
    }
    req.flash('error', 'You must be logged in to access this page.');
    res.redirect('/login'); // Redirect to login page if not authenticated
}

app.get('/home', async (req, res) => {
    try {
        //Populate only selected fields
        const products = await Product_Model.find({}).populate('owner', 'firstName lastName');
        res.render('home.ejs', { products });
    } catch (error) {
        console.log(error);
    }     
});

app.get('/show/:id', async (req, res) => {
    try {   
        const id = req.params.id;
        //Populate All fields in owner
        const product = await Product_Model.findById(id).populate('owner'); 
        if (product) {
            res.render('show.ejs', { product });
        } else {
            res.status(404).send("Product not found");
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// Protecting the '/create' route
app.get('/create', isAuthenticated, (req, res) => {
    try {
        res.render('create.ejs');
    } catch (error) {
        console.log(error);
        req.flash('error', 'Something went wrong.');
        res.redirect('/home');
    }
});

// Protecting the '/create' POST route
app.post('/create', isAuthenticated, async (req, res) => { 
    try {
        // Extracting data from req.body
        const { name, price, description, category, brand, stock, image } = req.body;

        // Creating a new product with the logged-in user as the owner
        const product = new Product_Model({
            name,
            price,
            description,
            category,
            brand,
            stock,
            image,
            owner: req.user._id // Assign logged-in user as owner
        });

        // Save the product to the database
        await product.save();
        req.flash('success', 'Product is created successfully!');
        res.redirect('/home');
    } catch (error) {
        req.flash('error', 'Error creating product: ' + error.message);
        res.redirect('/home');
    }
});


app.post('/delete_product/:id',isAuthenticated, async (req, res) => {
    try {
        // Check if the query parameter 'method_' is 'delete'
        if (req.query.method_ === 'delete') {
            const productId = req.params.id;
            await Product_Model.findByIdAndDelete(productId);
            req.flash('success', 'Product is deleted successfully!');
            res.redirect('/home'); // Redirect after deletion
        } else {
            res.status(400).send('Invalid method');
        }
    } catch (error) {
        res.status(500).send(error.message); 
    }
});

app.get('/update_product/:id',isAuthenticated, async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product_Model.findById(productId);
        if (product) {
            res.render('update.ejs', { product });
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) { 
        console.log(error);
        res.status(500).send(error.message);
    }
});

app.put('/update_product/:id',isAuthenticated, async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, price, description, category, brand, stock, image } = req.body;

        // Find the product by ID and update it with the new data
        const product = await Product_Model.findByIdAndUpdate(
            productId,
            { name, price, description, category, brand, stock, image },
            { new: true }  // Returns the updated product
        );

        if (product) {
            req.flash('success', 'Product is updated successfully!');
            res.redirect(`/show/${productId}`);  // Correct redirection to show the updated product
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {  
        res.status(500).send(error.message);
    }
});
 
// Signup Routes
app.get('/signup',(req,res)=>{
    res.render('signup.ejs');
}); 

app.post('/signup', async (req, res) => {
    try {
        let { firstName , lastName , email , password} = req.body ;
        const new_user = new User_Model({ email, firstName, lastName });
        const register_user = await User_Model.register(new_user,password);
        if(register_user){
            req.flash('success', 'User successfully registered! now its time to login !');
            res.redirect('/home');
        }
    } catch (error) { 
        // Set an error message if registration fails
        req.flash('error', error.message);
        // Redirect to signup page to show the error message
        res.redirect('/signup');
    }
}); 

// Login Route (GET) - Render login form
app.get('/login', (req, res) => {
    res.render('login.ejs');
});

// Login Route (POST) - Authenticate user
app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: 'Invalid email or password!',
    }),
    (req, res) => {
        req.flash('success', `Welcome back, ${req.user.firstName} ${req.user.lastName} !`);
        res.redirect('/home');
    }
);
// Logout Route
app.post('/logout', (req, res) => {    
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'You have been logged out!');
        res.redirect('/home');
    });
});
app.post('/add_review/:id', async (req, res) => {
    try {
        const productId = req.params.id; // Get product ID from URL
        const { rating, comment } = req.body; // Get rating and comment
        const userId = req.user ? req.user._id : req.body.userId; // Get user ID

        // Ensure user is logged in
        if (!userId) { 
            req.flash("error", "You must be logged in to leave a review.");
            return res.redirect(`/show/${productId}`);
        }
     
        // Validate input
        if (!rating || !comment) {
            req.flash("error", "Rating and comment are required.");
            return res.redirect(`/show/${productId}`);
        }

        // Create new review
        const newReview = new Review_model({
            product: productId,
            user: userId,
            rating: rating,
            comment: comment 
        });

        // Save the review
        await newReview.save();

        // Associate review with product
         await Product_Model.findByIdAndUpdate(productId, {
             $push: { reviews: newReview._id }
         });
        //await User_Model.findByIdAndUpdate(userId, {
        //    $push: { reviews: newReview._id }
        //});

        req.flash("success", "Review added successfully!");
        res.redirect(`/show/${productId}`); // Redirect to product page
    } catch (error) {
        req.flash("error", error.message);
        res.redirect(`/show/${productId}`);
    }
}); 

app.get('/view_reviews/:id', async (req, res) => {
    try {
        const current_product_id = req.params.id;

        // Fetch the product details
        const current_product = await Product_Model.findById(current_product_id);
        if (!current_product) {
            return res.status(404).send("Product not found");
        }

        // Fetch only reviews for the current product
        const reviews = await Review_Model.find({ product: current_product_id })
            .populate('user', 'firstName lastName') // Populate user details
            .populate('product', 'name'); // Populate product name

        res.render('review.ejs', {    
            reviews, 
            current_product, // Pass the full product object
            current_product_id, // Pass the product ID separately
            current_user: req.user || {} // Ensure current_user is not null
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});



app.delete('/delete_review/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const del_review = await Review_Model.findByIdAndDelete(id);

        if (del_review) {
            req.flash("success", "Review deleted successfully");
            res.redirect(`/view_reviews/${del_review.product}`);
        } else {
            req.flash("error", "Review not found");
            res.redirect('back');
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/order/:id', isAuthenticated , async (req,res)=>{
    try {
        const product_id = req.params.id ;
        const product = await Product_Model.findById(product_id);
        res.render('order.ejs',{product});        
    } catch (error) {   
        res.status(500).send(error);
    }
}); 

app.post('/order/:id', async (req, res) => {
    try {
        const productId = req.params.id; // Get product ID from URL
        const { quantity, totalAmount, address } = req.body;
        
        // Simulate getting logged-in user (replace with actual authentication)
        const userId = req.user ? req.user._id : req.body.userId; // Get user ID

        // Ensure user is logged in
        if (!userId) { 
            req.flash("error", "You must be logged in to leave a review.");
            return res.redirect(`/show/${productId}`);
        }

        // Create new order
        const newOrder = new Order_Model({
            user: userId,
            product : productId,
            quantity,
            totalAmount,
            address
        });

        await newOrder.save(); // Save to database
           // Associate review with product
           await Product_Model.findByIdAndUpdate(productId, {
            $push: { orders: newOrder._id }
        });
        req.flash("success", "Order place successfully !!");
        res.redirect(`/show/${productId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error. Please try again.");
    }
});

app.get('/cart', async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect('/login'); // Ensure user is authenticated
        } 

        const userId = req.user._id; // Get the authenticated user's ID
        let orders = await Order_Model.find({ user: userId })
            .populate('product')
            .populate('user', 'firstName lastName');

        // Filter out orders where the product is null (product was likely deleted)
        orders = orders.filter(order => order.product);

        res.render('cart', { orders, user: req.user }); // Pass user details separately
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.delete('/cancel-order/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const del_order = await Order_Model.findByIdAndDelete(id);

        if (del_order) {
            req.flash("success", "Order deleted successfully");
            res.redirect(`/cart`);
        } else {
            req.flash("error", "Order not found");
            res.redirect(`/cart`);
        }
    } catch (error) {  
        res.status(500).send(error);
    }
});
app.get('/my-orders', async (req, res) => {
    try {
        // Check if the user is authenticated
        if (!req.isAuthenticated()) {
            req.flash("error", "You must be logged in to view your orders.");
            return res.redirect('/login');
        }

        // Get the authenticated user's ID
        const ownerId = req.user._id;

        // Find all products owned by the authenticated user
        const ownedProducts = await Product_Model.find({ owner: ownerId })
            .populate({
                path: 'orders',
                populate: [
                    {
                        path: 'user', // Get the user who placed the order
                        select: 'firstName lastName email'
                    },
                    {
                        path: 'product', // Get product details for the order
                        select: 'name'
                    }
                ]
            });

        // Extract all orders from the owned products
        const allOrders = ownedProducts.reduce((orders, product) => {
            return orders.concat(product.orders);
        }, []);

        // Pass the current user to the EJS template
        res.render('owner_orders', { 
            allOrders,
            currentUser: req.user  // Pass current authenticated user
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error. Please try again.");
    }
});

app.post('/accept-order/:orderId', async (req, res) => {
    try {
        // Get order ID from URL
        const orderId = req.params.orderId;

        // Update order status to 'Processing'
        await Order_Model.findByIdAndUpdate(orderId, { status: 'Processing' });

        req.flash("success", "Order accepted successfully!");
        res.redirect('/my-orders');
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error. Please try again.");
    }
});

// Reject Order Route
app.post('/reject-order/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // Update order status to 'Cancelled'
        await Order_Model.findByIdAndUpdate(orderId, { status: 'Cancelled' });

        req.flash("info", "Order rejected successfully!");
        res.redirect('/my-orders');
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error. Please try again.");
    }
});

app.get('*', (req, res) => {
    res.render('universal.ejs');
});

app.listen(3000, () => {
    console.log('✅ App is running on port 3000');
});
