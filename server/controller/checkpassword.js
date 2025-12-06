const UserModel = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function checkpassword(request, response) {
  try {
    const { password, userId } = request.body;

    const user = await UserModel.findById(userId);
    const verifyPassword = await bcryptjs.compare(password, user.password);
    if (!verifyPassword) {
      return response.status(400).json({
        message: "Enter the correct password. ",
        error: true,
      });
    }

    const tokenData = {
      id: user._id,
      email: user.email,
    };
    const token = await jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    // Apply this change in both checkpassword.js and logout.js

    const cookieOption = {
      httpOnly: true,
      // Use secure cookies only in production
      secure: process.env.NODE_ENV === "production",
    };

    return response.cookie("token", token, cookieOption).status(200).json({
      message: "Login successfully",
      token: token,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
}

module.exports = checkpassword;
