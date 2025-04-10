let io;
const connectedUsers = new Map(); // Store user socket mappings
const Notification = require('./database/models/notification');

// Initialize Socket.io
const allowedOrigins = ['http://13.201.119.25:3000', 'http://hotelmart.in','https://hotelmart.in', 'http://hotelmart.in:3000','http://localhost:4200'];
const initSocket = (server) => {
    io = require('socket.io')(server, {
        cors: {
            // origin: 'http://localhost:4200', // Allow your frontend's origin
            origin:allowedOrigins,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true,
        },
    });

//     io.on('connection', (socket) => {
//         console.log(`New connection: ${socket.id}`);

//         // Register user with their socket
//         socket.on('register', (userId) => {
//             sendUnreadCountUpdate(userId);

//             connectedUsers.set(userId, socket.id);
//             console.log(`User ${userId} connected with socket ${socket.id}`);
//         });
// // Emit unread count update to the user
// io.on('unreadCountUpdate' , ()=>{
//     let sendUnreadCountUpdate = async (userId) => {
//       const unreadCount = await Notification.countDocuments({ userId, isRead: false });
//       const socketId = connectedUsers.get(userId);
//       if (socketId) {
//           io.to(userId).emit('unreadCountUpdate', unreadCount); // Emit updated unread count
//       }
//   }})
//         // Handle user disconnect
//         socket.on('disconnect', () => {
//             for (const [userId, socketId] of connectedUsers.entries()) {
//                 if (socketId === socket.id) {
//                     connectedUsers.delete(userId);
//                     console.log(`User ${userId} disconnected`);
//                     break;
//                 }
//             }
//         });
//     });
   io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Register user with their socket
    socket.on('register', (userId) => {
        // Update the user's socket mapping
        connectedUsers.set(userId, socket.id);

        console.log(`User ${userId} connected with socket ${socket.id}`);

        // Send the initial unread count to the user
        sendUnreadCountUpdate(userId);
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId);
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
    })
}
)};
const sendUnreadCountUpdate = async (userId) => {
    try{
        const unreadCount = await Notification.countDocuments({ userId, isRead: false });
        const socketId = connectedUsers.get(userId.toString());
        if (socketId) {
          getIo().to(socketId).emit('unreadCountUpdate', unreadCount);
        }
    }
    catch(error){
     console.error(error)
    }

};
// Get the current io instance
const getIo = () => {
    if (!io) {
        throw new Error('Socket.io is not initialized!');
    }
    return io;
};

// Export the necessary functions and variables
module.exports = {
    initSocket,
    getIo,
    connectedUsers,
};
