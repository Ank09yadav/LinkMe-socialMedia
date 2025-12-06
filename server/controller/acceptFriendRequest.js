const UserModel = require("../models/userModel");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const { getIo } = require('../socket');

async function acceptFriendRequest(request, response) {
    try {
        const token = request.cookies.token || "";
        const currentUser = await getUserDetailsFromToken(token);
        const { friendId } = request.body;

        // Add each other to friends lists and remove the request
        await UserModel.updateOne(
            { _id: currentUser._id },
            { $addToSet: { friends: friendId }, $pull: { friendRequests: friendId } }
        );
        await UserModel.updateOne(
            { _id: friendId },
            { $addToSet: { friends: currentUser._id } }
        );

        // REAL-TIME: Notify both users
        const io = getIo();
        if (io) {
            // 1. Notify the friend who sent the request
            const accepterDetails = await UserModel.findById(currentUser._id).select("name userName profilePic _id");
            io.to(friendId).emit('friendRequestAccepted', accepterDetails);
            
            // 2. Notify the current user to update their own list
            const newFriendDetails = await UserModel.findById(friendId).select("name userName profilePic _id");
            io.to(currentUser._id.toString()).emit('friendRequestAccepted', newFriendDetails);
        }

        return response.status(200).json({ message: "Friend request accepted.", success: true });

    } catch (error) {
        console.error("Error in acceptFriendRequest: ", error);
        return response.status(500).json({ message: "Internal Server Error", error: true });
    }
}

module.exports = acceptFriendRequest;