const mongoose = require('mongoose');

async function connectDB() {
    try {
        // Attach listeners before connecting
        mongoose.connection.on('connected', () => {
            console.log("✅ Connected to Database");
        });

        mongoose.connection.on('error', (error) => {
            console.error("❌ MongoDB connection error: ", error);
        });

        await mongoose.connect(process.env.MONGODB_URI);

    } catch (error) {
        console.error("Initial MongoDB connection failed!", error);
        process.exit(1); // Exit process with failure
    }
}

module.exports = connectDB;