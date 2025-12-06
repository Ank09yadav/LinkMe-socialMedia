const { ConversationModel, MessageModel } = require("../models/ConversationModel");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Allow images, videos, audio, and common document types
        const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|mp3|wav|pdf|doc|docx|txt|zip|rar/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

async function getConversation(request, response) {
  try {
    const currentUser = await getUserDetailsFromToken(request.cookies.token || "");
    const { otherUserId } = request.params;

    const conversation = await ConversationModel.findOne({
      participants: { $all: [currentUser._id, otherUserId] },
    });

    if (!conversation) {
      return response.status(200).json([]); // Return empty array if no history
    }

    const messages = await MessageModel.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    return response.status(200).json(messages);

  } catch (error) {
    console.error("Error in getConversation:", error);
    return response.status(500).json({ message: "Internal Server Error", error: true });
  }
}

async function sendMessage(request, response) {
  try {
    const currentUser = await getUserDetailsFromToken(request.cookies.token || "");
    const { receiverId, text, fileName, fileType, fileData, fileSize } = request.body;
    
    let conversation = await ConversationModel.findOne({
      participants: { $all: [currentUser._id, receiverId] },
    });
    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: [currentUser._id, receiverId],
      });
    }

    const newMessage = new MessageModel({
      conversationId: conversation._id,
      sender: currentUser._id,
      text: text || "",
      fileName: fileName || "",
      fileType: fileType || "",
      fileData: fileData || "",
      fileSize: fileSize || 0,
    });
    const savedMessage = await newMessage.save();

    // Note: The client (MessagePage.jsx) is responsible for
    // emitting the 'sendMessage' event via socket after this API call succeeds.

    return response.status(201).json({ success: true, data: savedMessage });

  } catch (error) {
    console.error("Error in sendMessage:", error);
    return response.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

async function sendFile(request, response) {
  try {
    const currentUser = await getUserDetailsFromToken(request.cookies.token || "");
    const { receiverId } = request.body;

    let conversation = await ConversationModel.findOne({
      participants: { $all: [currentUser._id, receiverId] },
    });
    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: [currentUser._id, receiverId],
      });
    }

    // File is uploaded via multer, available in request.file
    if (!request.file) {
      return response.status(400).json({ success: false, message: "No file uploaded" });
    }

    const fileUrl = `/uploads/${request.file.filename}`;
    const newMessage = new MessageModel({
      conversationId: conversation._id,
      sender: currentUser._id,
      text: "",
      fileName: request.file.originalname,
      fileType: request.file.mimetype,
      fileUrl: fileUrl,
      fileSize: request.file.size,
    });
    const savedMessage = await newMessage.save();

    return response.status(201).json({ success: true, data: savedMessage });

  } catch (error) {
    console.error("Error in sendFile:", error);
    return response.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

async function clearConversation(request, response) {
  try {
    const currentUser = await getUserDetailsFromToken(request.cookies.token || "");
    const { otherUserId } = request.params;

    const conversation = await ConversationModel.findOne({
      participants: { $all: [currentUser._id, otherUserId] },
    });

    if (!conversation) {
      return response.status(200).json({ message: "No conversation found to clear.", success: true });
    }

    // Delete all messages in the conversation
    await MessageModel.deleteMany({
      conversationId: conversation._id,
    });

    return response.status(200).json({ message: "Conversation cleared.", success: true });

  } catch (error) {
    console.error("Error in clearConversation:", error);
    return response.status(500).json({ message: "Internal Server Error", error: true });
  }
}

module.exports = { getConversation, sendMessage, sendFile, clearConversation, upload };
