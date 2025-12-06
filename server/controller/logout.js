const UserModel = require('../models/userModel');
const getUserDetailsFromToken = require('../helpers/getUserDetailsFromToken');
const { getIo } = require('../socket');

async function logout(request, response) {
    try {
        const token = request.cookies.token || "";
        const user = await getUserDetailsFromToken(token);
        const io = getIo();
        const lastSeenTime = new Date();

        if (user) {
            // Update user status in DB
            await UserModel.findByIdAndUpdate(user._id, {
                isOnline: false,
                lastSeen: lastSeenTime
            });

            // Notify friends of logout
            if (user.friends) {
                user.friends.forEach(friendId => {
                    io.to(friendId.toString()).emit('userOffline', { 
                        userId: user._id.toString(), 
                        lastSeen: lastSeenTime 
                    });
                });
            }
        }

        const cookieOption = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" 
        };

        return response.cookie('token', '', cookieOption).status(200).json({
            message: "Logout successful",
            success: true
        });
    } catch (error) {
        console.error("Error in logout: ", error); 
        return response.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = logout;