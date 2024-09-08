const express = require('express');
const app = express();
const http = require('http').Server(app);
const { Server } = require('socket.io');  // Use 'Server' for better clarity with socket.io
const cors = require('cors');
const mongoose = require('mongoose');

// Express CORS Configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000',  // Frontend origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// MongoDB connection
const connnectToDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://tchetan308:xyxIZHiPbqk4BmHu@cluster0.wkrkluf.mongodb.net/int-collection?retryWrites=true&w=majority&appName=Cluster0');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.log('Error connecting to MongoDB:', err);
    }
}

connnectToDB();

// Message sub-schema
const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true },  // username of the sender
    roomId: { type: String, required: true },  // room id of the sender
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

app.use(express.static(__dirname + '/public'));

// Apply CORS for Socket.IO
const io = new Server(http, {
    cors: {
        origin: 'http://localhost:3000',  // Frontend origin (adjust as necessary)
        methods: ['GET', 'POST'],         // Allowed HTTP methods for socket communication
        allowedHeaders: ['Content-Type'], // Allowed custom headers
        credentials: true                 // Whether to allow credentials (cookies, etc.)
    }
});

// Socket.IO event handling
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    socket.on('message', (payload) => {
        const { sender, receiver, message, roomId } = payload;

        // // Create a new message document
        // const newMessage = new messageSchema({
        //     sender,
        //     roomId,
        //     content: message
        // });
        // await newMessage.save();
        console.log('Received message:', payload);
        io.emit(roomId, message);
    });
});

// Start the server
http.listen(8000, () => {
    console.log('Server started on port 8000');
});
