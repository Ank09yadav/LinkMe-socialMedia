const UserModel = require("../models/userModel");

async function searchUser(request, response) {
    try {
        const { search } = request.body;

        const query = new RegExp(search, "i"); // Case-insensitive search

        const users = await UserModel.find({
            $or: [
                { name: query },
                { userName: query }
            ]
        }).select("-password");

        return response.status(200).json({
            message: "Users found.",
            data: users,
            success: true
        });

    } catch (error) {
        console.error("Error in searchUser: ", error);
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true
        });
    }
}

module.exports = searchUser;