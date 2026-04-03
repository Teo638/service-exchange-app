const express = require('express');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); 
require('dotenv').config();
const pool = require('./src/config/db'); 
const path = require('path');
const cookieParser = require('cookie-parser');

const authRoutes = require('./src/routes/authRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const requestRoutes = require('./src/routes/requestRoutes');
const messageRoutes = require('./src/routes/messageRoutes'); 
const questionRoutes = require('./src/routes/questionRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", 
        methods: ["GET", "POST"],
        credentials: true 
    }
});

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true                
}));
app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Server radi, baza je povezana.');
});

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes); 
app.use('/api/questions', questionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);


let onlineUsers = [];

io.on('connection', (socket) => {
    
    socket.on('addUser', (userId) => {
        if (!onlineUsers.some(user => user.userId === userId)) {
            onlineUsers.push({ userId, socketId: socket.id });
        }
        io.emit('getUsers', onlineUsers);
    });

    
    socket.on('sendMessage', ({ senderId, receiverId, content }) => {
        const user = onlineUsers.find(user => user.userId === receiverId);
        if (user) {
            io.to(user.socketId).emit('getMessage', {
                senderId,
                content,
            });
        }
    });

    
    socket.on('disconnect', () => {
        onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id);
        io.emit('getUsers', onlineUsers);
    });
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Greška pri povezivanju na bazu:', err);
    } else {
        console.log('PostgreSQL povezan uspješno');
    }
});


server.listen(PORT, () => {
    console.log(`Server je pokrenut na portu ${PORT}`);
});