const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(
            process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/SimpleQuiz'
        );

        console.log(`MongoDB connected at ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        if (error.reason) console.error(`Reason: ${error.reason}`);
        process.exit(1);
    }
};

module.exports = connectDB;
