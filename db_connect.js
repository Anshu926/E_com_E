const mongoose = require('mongoose');

async function connect_db() {
    try {
        const connection = await mongoose.connect('mongodb://127.0.0.1:27017/E-COM-E');
        if (connection) {
            console.log('✅ DB is connected successfully !');
        }
    } catch (error) {
        console.error(`❌ Error in connection: ${error.message}`);
    }
}

module.exports = connect_db; 