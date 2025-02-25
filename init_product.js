const Product_Model = require('./models/product_schema'); // Adjust path if needed
const connect_db = require('./db_connect');

connect_db();

const init_products = async () => {
    try {
        // Define sample products to initialize
        const products = [
            {
                name: 'Apple iPhone 13',
                price: 799,
                description: 'The Apple iPhone 13 offers a stunning 6.1-inch display, A15 Bionic chip, and a dual-camera system.',
                category: 'electronics', // Updated category
                stock: 120,
                image: 'https://navbharattimes.indiatimes.com/thumb/114675573/apple-iphone-13-price-on-amazon-sale-114675573.jpg?imgsize=1127229&width=1600&height=900&resizemode=75',
                brand: 'Apple',
            },
            {
                name: 'Samsung Galaxy S21',
                price: 699,
                description: 'The Samsung Galaxy S21 features a 6.2-inch Dynamic AMOLED display, triple-camera setup, and 8GB RAM.',
                category: 'electronics', // Updated category
                stock: 150,
                image: 'https://2.img-dpreview.com/files/p/E~C14x0S1156x650T1200x675~articles/6762980224/CleanShot_2021-01-14_at_10.22.52_2x.jpeg',
                brand: 'Samsung',
            },
            {
                name: 'Sony WH-1000XM4 Headphones',
                price: 349,
                description: 'Noise-cancelling over-ear headphones with exceptional sound quality, 30-hour battery life, and touch controls.',
                category: 'accessories', // Updated category
                stock: 80,
                image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhqTedInm3T-1ZApAW1stHSt9PLGhSz-8wlRtX-mbI_o_1Sh2qVJ7EBKk4C5dCUV9b4y-k7Ew23dG27nQbfBdWVFxzZcXLPj6-4iJHB_OJ8vWGsgxk_ApZ0BC8yLmE-7_4_Xuf_nmrS_PgC/s1920/wh4still21.jpg',
                brand: 'Sony',
            },
            {
                name: 'Nike Air Max 270',
                price: 150,
                description: 'Sporty and stylish sneakers featuring a large Air unit in the sole for added comfort and support.',
                category: 'clothing', // Updated category (Footwear fits under clothing)
                stock: 200,
                image: 'https://mir-s3-cdn-cf.behance.net/projects/404/30aaeb104287817.Y3JvcCwxNTM0LDEyMDAsMzQsMA.png',
                brand: 'Nike',
            },
            {
                name: 'HP Victus',
                price: 999,
                description: 'The HP Victus is a tuf, heavy laptop with a stunning 13.3-inch 4K display and Ryzen 5600, graphic card RTX 3050 gaming specs!',
                category: 'electronics', // Updated category
                stock: 50,
                image: 'https://i.ytimg.com/vi/tjWd5HDwLhc/sddefault.jpg',
                brand: 'HP',
            },
            {
                name: 'Bose SoundLink Revolve+',
                price: 329,
                description: 'Portable Bluetooth speaker with deep, loud, and immersive sound, perfect for outdoor gatherings and parties.',
                category: 'electronics', // Updated category
                stock: 60,
                image: 'https://i.pinimg.com/736x/49/a9/a1/49a9a17a54c560a7fff443825b994dfc.jpg',
                brand: 'Bose',
            }
        ];

        // Loop through each product and insert if it doesn't exist
        for (let product of products) {
            const existingProduct = await Product_Model.findOne({ name: product.name });

            if (!existingProduct) {
                // If the product does not exist, insert it
                await Product_Model.create(product);
                console.log(`✅ Product "${product.name}" added successfully!`);
            } else {
                console.log(`❌ Product "${product.name}" already exists.`);
            }
        }
    } catch (error) {
        console.error(`❌ Error adding products: ${error.message}`);
    }
};

// Call the function to initialize products
init_products();
