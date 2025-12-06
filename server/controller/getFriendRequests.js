const UserModel = require("../models/userModel");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");

async function getFriendRequests(request, response) {
    try {
        const token = request.cookies.token || "";
        const currentUser = await getUserDetailsFromToken(token);

        const userWithRequests = await UserModel.findById(currentUser._id)
            .populate('friendRequests', 'name userName profilePic _id');

        return response.status(200).json({
            message: "Friend requests retrieved.",
            data: userWithRequests.friendRequests,
            success: true
        });

    } catch (error) {
        console.error("Error in getFriendRequests: ", error);
        return response.status(500).json({ message: "Internal Server Error", error: true });
    }
}

module.exports = getFriendRequests;