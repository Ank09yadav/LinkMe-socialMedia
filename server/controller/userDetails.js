const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");

async function userDetails(request, response) {
    try {
        const token = request.cookies.token || "";
        const currentUser = await getUserDetailsFromToken(token);

        if (!currentUser) {
            return response.status(401).json({
                message: "Unauthorized: Invalid or expired session.",
                error: true
            });
        }

        return response.status(200).json({
            message: "User details retrieved successfully.",
            data: currentUser,
            success: true
        });

    } catch (error) {
        console.error("Error in userDetails: ", error);
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true
        });
    }
}

module.exports = userDetails;