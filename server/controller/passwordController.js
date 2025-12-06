const UserModel = require('../models/userModel');
const OtpModel = require('../models/otp.model');
const { sendMail } = require('../helpers/SendEmail');
const bcrypt = require('bcryptjs');


const sendPasswordResetOTP = async (request, response) => {
    try {
        const { email } = request.body;
        if (!email) {
            return response.status(400).json({ success: false, message: 'Email is required.' });
        }

        const user = await UserModel.findOne({ email });
        // IMPORTANT: To prevent "email enumeration" (letting hackers know which emails are registered),
        // we send a 200 OK response *even if the user doesn't exist*.
        if (!user) {
            return response.status(200).json({ success: true, message: 'If this email is registered, an OTP has been sent.' });
        }

        // Generate a 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        // Delete any old OTPs for this email
        await OtpModel.deleteMany({ email });

        // Save the new OTP
        const newOtp = new OtpModel({ email, otp });
        await newOtp.save();

        // Send the professional email
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #333;">LinkMe Password Reset</h2>
                <p>Hello ${user.name},</p>
                <p>You requested a password reset. Please use the 4-digit One-Time Password (OTP) below to proceed.</p>
                <p style="font-size: 24px; font-weight: bold; color: #bb86fc; letter-spacing: 2px; margin: 20px 0;">
                    ${otp}
                </p>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
                <br>
                <p>Thanks,<br>The LinkMe Team</p>
            </div>
        `;

        await sendMail(email, 'Your LinkMe Password Reset OTP', `Your OTP is: ${otp}`, html);

        return response.status(200).json({ success: true, message: 'If this email is registered, an OTP has been sent.' });

    } catch (error) {
        console.error("Error sending OTP:", error.message);
        return response.status(500).json({ success: false, message: 'Server error.' });
    }
};


const verifyPasswordResetOTP = async (request, response) => {
    try {
        const { email, otp } = request.body;
        if (!email || !otp) {
            return response.status(400).json({ success: false, message: 'Email and OTP are required.' });
        }

        const otpDoc = await OtpModel.findOne({ email, otp });

        // `otpDoc` will be null if no match or if it has expired (due to the TTL index)
        if (!otpDoc) {
            return response.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        return response.status(200).json({ success: true, message: 'OTP verified.' });

    } catch (error) {
        console.error("Error verifying OTP:", error.message);
        return response.status(500).json({ success: false, message: 'Server error.' });
    }
};

//  RESET PASSWORD 
const resetPassword = async (request, response) => {
    try {
        const { email, otp, newPassword } = request.body;
        if (!email || !otp || !newPassword) {
            return response.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
        }

        // --- Security Check: Re-verify the OTP ---
        const otpDoc = await OtpModel.findOne({ email, otp });
        if (!otpDoc) {
            return response.status(400).json({ success: false, message: 'Invalid or expired OTP. Please start over.' });
        }
        
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password in the database
        const updatedUser = await UserModel.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return response.status(404).json({ success: false, message: 'User not found.' });
        }

        // Invalidate the OTP by deleting it
        await OtpModel.deleteOne({ _id: otpDoc._id });

        return response.status(200).json({ success: true, message: 'Password has been reset successfully.' });

    } catch (error) {
        console.error("Error resetting password:", error.message);
        return response.status(500).json({ success: false, message: 'Server error.' });
    }
};

module.exports = {
    sendPasswordResetOTP,
    verifyPasswordResetOTP,
    resetPassword
};