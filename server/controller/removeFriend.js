const UserModel = require("../models/userModel");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const { getIo } = require('../socket');

async function removeFriend(request, response) {
    try {
        const token = request.cookies.token || "";
        const currentUser = await getUserDetailsFromToken(token);
        const { friendId } = request.body;

        // Remove each other from friends lists
        await UserModel.updateOne({ _id: currentUser._id }, { $pull: { friends: friendId } });
        await UserModel.updateOne({ _id: friendId }, { $pull: { friends: currentUser._id } });

        // REAL-TIME: Notify both users
        const io = getIo();
        if (io) {
            // 1. Notify the friend they were removed
            io.to(friendId).emit('friendRemoved', { removedById: currentUser._id });
            
            // 2. Notify the current user to update their list
            io.to(currentUser._id.toString()).emit('friendRemoved', { removedFriendId: friendId });
        }

        return response.status(200).json({ message: "Friend removed successfully.", success: true });

    } catch (error) {
        console.error("Error in removeFriend: ", error);
        return response.status(500).json({ message: "Internal Server Error", error: true });
    }
}

module.exports = removeFriend;