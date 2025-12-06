const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const getUserDetailsFromToken = async (token) => {
    if (!token) {
        return null; // Return null if no token is provided
    }

    try {
        // Verify the token. This will throw an error if it's invalid or expired.
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
        // Find the user by the ID from the token payload
        const user = await UserModel.findById(decode.id).select('-password');
        
        return user; // Return the user object
    } catch (error) {
        // If verification fails for any reason (e.g., expired, invalid signature)
        console.error("Invalid token:", error.message);
        return null; // Return null on any error
    }
};

module.exports = getUserDetailsFromToken;