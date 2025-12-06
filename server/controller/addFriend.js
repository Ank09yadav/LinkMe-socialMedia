const UserModel = require("../models/userModel");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const { getIo } = require('../socket');

async function addFriend(request, response) {
    try {
        const token = request.cookies.token || "";
        const currentUser = await getUserDetailsFromToken(token);
        const { friendId } = request.body;

        const friend = await UserModel.findById(friendId);
        if (!friend) {
            return response.status(404).json({ message: "User not found.", error: true });
        }

        await UserModel.updateOne(
            { _id: friendId },
            { $addToSet: { friendRequests: currentUser._id } }
        );

        // REAL-TIME: Notify the other user
        const io = getIo();
        if (io) {
            const senderDetails = await UserModel.findById(currentUser._id).select("name userName profilePic _id");
            // Emit to the friend's private room
            io.to(friendId).emit('newFriendRequest', senderDetails);
        }

        return response.status(200).json({
            message: "Friend request sent.",
            success: true
        });

    } catch (error) {
        console.error("Error in addFriend: ", error);
        return response.status(500).json({ message: "Internal Server Error", error: true });
    }
}

module.exports = addFriend;