const { Server } = require('socket.io');
const UserModel = require('./models/userModel'); // Import UserModel

let io;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true
        }
    });

    io.on('connection', async (socket) => {
        console.log('User connected:', socket.id);
        
        const userId = socket.handshake.query.userId;
        if (!userId) {
            return socket.disconnect();
        }
        
        socket.userId = userId; 
        socket.join(userId); 

        try {
            await UserModel.findByIdAndUpdate(userId, { isOnline: true });
            const user = await UserModel.findById(userId);
            if (user && user.friends) {
                user.friends.forEach(friendId => {
                    io.to(friendId.toString()).emit('userOnline', { userId });
                });
                io.to(userId).emit('userOnline', { userId });
            }
        } catch (error) {
            console.error('Error on socket connection:', error);
        }

        // --- Standard Chat ---
        socket.on('sendMessage', (data) => {
            const { receiverId, message } = data;
            if (receiverId) {
                socket.to(receiverId).emit('receiveMessage', {
                    senderId: data.senderId,
                    message: message
                });
            }
        });

        // --- File Sending ---
        socket.on('sendFileMessage', (data) => {
            const { receiverId, message } = data;
            if (receiverId) {
                socket.to(receiverId).emit('receiveFileMessage', {
                    senderId: data.senderId,
                    message: message
                });
            }
        });

        // --- NEW: Watch Together Video Events ---

        /**
         * When a user selects a video to watch
         */
        socket.on('video:select', (data) => {
            const { receiverId, videoData } = data;
            if (receiverId) {
                // Send the selected video object to the receiver
                socket.to(receiverId).emit('video:select', { videoData });
            }
        });

        /**
         * When a user plays the video
         */
        socket.on('video:play', (data) => {
            const { receiverId } = data;
            if (receiverId) {
                // Tell the receiver to play
                socket.to(receiverId).emit('video:play');
            }
        });

        /**
         * When a user pauses the video
         */
        socket.on('video:pause', (data) => {
            const { receiverId } = data;
            if (receiverId) {
                // Tell the receiver to pause
                socket.to(receiverId).emit('video:pause');
            }
        });

        /**
         * When a user seeks to a new time
         */
        socket.on('video:sync', (data) => {
            const { receiverId, time } = data;
             if (receiverId) {
                // Tell the receiver to sync to the new time
                socket.to(receiverId).emit('video:sync', { time });
            }
        });

        /**
         * When a user closes the video player
         */
         socket.on('video:close', (data) => {
            const { receiverId } = data;
            if (receiverId) {
                // Relay the event to the receiver
                socket.to(receiverId).emit('video:close');
            }
        });

        // --- Disconnect ---
        socket.on('disconnect', async () => {
            console.log('User disconnected:', socket.id);
            if (socket.userId) {
                try {
                    const lastSeenTime = new Date();
                    const user = await UserModel.findByIdAndUpdate(
                        socket.userId, 
                        { isOnline: false, lastSeen: lastSeenTime },
                        { new: true } 
                    );

                    if (user && user.friends) {
                        user.friends.forEach(friendId => {
                            io.to(friendId.toString()).emit('userOffline', { 
                                userId: socket.userId, 
                                lastSeen: lastSeenTime 
                            });
                        });
                    }
                } catch (error) {
                    console.error('Error on socket disconnect:', error);
                }
            }
        });
    });

    return io;
}

function getIo() {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
}

module.exports = { initSocket, getIo };
