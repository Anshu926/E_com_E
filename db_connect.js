const mongoose = require('mongoose');

async function connect_db() {
    try {
        const connection = await mongoose.connect('mongodb+srv://e_com_web:2005@cluster0.6hhoa.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0');
        if (connection) {
            console.log('✅ DB is connected successfully !');
        }
    } catch (error) {
        console.error(`❌ Error in connection: ${error.message}`);
    }
}

module.exports = connect_db; 
