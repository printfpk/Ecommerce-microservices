const mongoose = require('mongoose');


async function connectDB() {
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Database connected successfully");
    }catch(err){
        console.error("Database connection failed", err);
    }
}

module.exports = connectDB;