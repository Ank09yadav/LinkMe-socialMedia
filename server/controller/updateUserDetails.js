const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const UserModel = require("../models/userModel");
const { getIo } = require('../socket'); // Import getIo

async function updateUserDetails(request, response) {
    try {
        const token = request.cookies.token || "";
        const currentUser = await getUserDetailsFromToken(token);
        const { name, userName, profilePic } = request.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (profilePic !== undefined) updateData.profilePic = profilePic;
        if (userName !== undefined) updateData.userName = userName;
        
        await UserModel.updateOne({ _id: currentUser._id }, updateData);

        const updatedUserInformation = await UserModel.findById(currentUser._id).select("-password");

        // REAL-TIME: Notify all friends about the update
        const io = getIo();
        if (io && updatedUserInformation.friends) {
            updatedUserInformation.friends.forEach(friendId => {
                // Emit to each friend's private room
                io.to(friendId.toString()).emit('friendDetailsUpdated', updatedUserInformation);
            });
        }

        return response.status(200).json({
            message: "User updated successfully.",
            data: updatedUserInformation,
            success: true
        });

    } catch (error) {
        console.error("Error in updateUserDetails: ", error);
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true
        });
    }
}

module.exports = updateUserDetails;