const UserModel = require("../models/userModel");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const { getIo } = require('../socket');

async function rejectFriendRequest(request, response) {
    try {
        const token = request.cookies.token || "";
        const currentUser = await getUserDetailsFromToken(token);
        const { friendId } = request.body;

        await UserModel.updateOne(
            { _id: currentUser._id },
            { $pull: { friendRequests: friendId } }
        );

        // REAL-TIME: Notify the current user (accepter) to update their request list
        const io = getIo();
        if (io) {
            io.to(currentUser._id.toString()).emit('friendRequestRejected', { rejectedFriendId: friendId });
        }

        return response.status(200).json({ message: "Friend request rejected.", success: true });

    } catch (error) {
        console.error("Error in rejectFriendRequest: ", error);
        return response.status(500).json({ message: "Internal Server Error", error: true });
    }
}

module.exports = rejectFriendRequest;