const mongoose = require('mongoose');

// --- NEW Message Schema ---
const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Conversation'
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'user'
    },
    text: {
        type: String,
        default: ""
    },
    imageUrl: {
        type: String,
        default: ""
    },
    videoUrl: {
        type: String,
        default: ""
    },
    fileName: {
        type: String,
        default: ""
    },
    fileType: {
        type: String,
        default: "" // e.g., 'image', 'video', 'audio', 'document'
    },
    fileUrl: {
        type: String,
        default: "" // file path on server
    },
    fileSize: {
        type: Number,
        default: 0 // file size in bytes
    },
    seen: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// --- NEW Conversation Schema ---
const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.ObjectId,
        ref: 'user'
    }]
}, {
    timestamps: true
});

const MessageModel = mongoose.model('Message', messageSchema);
const ConversationModel = mongoose.model('Conversation', conversationSchema);

module.exports = {
    MessageModel,
    ConversationModel
};