const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the user placing the order
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the product
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1 
    },
    totalAmount: {
        type: Number,
        required: true 
    },
    address: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Order_Model = mongoose.model('Order', orderSchema);

module.exports = Order_Model;
