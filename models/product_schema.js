const mongoose = require('mongoose');

const product_schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: [
            'electronics', 
            'clothing', 
            'accessories', 
            'books', 
            'jewelry', 
            'home appliances', 
            'sports', 
            'kids'
        ],
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 1,
    },
    image: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referencing the User model correctly
        required : true,
    },
    reviews: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review_Model',
     }], 
     orders: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
     }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Product_Model = mongoose.model('Product', product_schema);

module.exports = Product_Model;
