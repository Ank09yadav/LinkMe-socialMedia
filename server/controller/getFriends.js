const UserModel = require("../models/userModel");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");

async function getFriends(request, response) {
    try {
        const token = request.cookies.token || "";
        const user = await getUserDetailsFromToken(token);

        if (!user) {
            return response.status(401).json({
                message: "Unauthorized",
                error: true
            });
        }

        // Get user's friends with their details, including online status
        const userWithFriends = await UserModel.findById(user._id)
            .populate('friends', '-password -friends -friendRequests'); 

        return response.status(200).json({
            message: "Friends retrieved successfully",
            data: userWithFriends.friends,
            success: true
        });

    } catch (error) {
        console.error("Error in getFriends: ", error); 
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = getFriends;