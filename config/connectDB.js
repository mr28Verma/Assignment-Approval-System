const mongoose = require('mongoose');

require('dotenv').config();

module.exports.connectDB = () => {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("DB connected successfully..."))
        .catch((err) => {
            console.error("MongoDB connection error:", err);
        });
};