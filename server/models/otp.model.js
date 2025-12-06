const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        default: () => Date.now() + 10 * 60 * 1000, 
    }
});

// This TTL index automatically deletes the OTP after 'expiresAt' time
otpSchema.index({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

const OtpModel = mongoose.model('Otp', otpSchema);
module.exports = OtpModel;

