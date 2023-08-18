const express = require('express');
const app = express();
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// socket.io setup
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })

app.use(express.static(path.join(__dirname, 'public')));

const port = 3000

app.set('view engine', 'hbs')

app.get('/', (req, res) => {
    res.render('index')
});

const rooms = {}; // Store room data with players

// Backend players array to store players and their teams
const players = [];

function joinTeam(roomCode, playerName, team) {
    if (rooms[roomCode]) {
        const player = { playerName, socketId: socket.id, team };
        rooms[roomCode].push(player);
        socket.join(roomCode);
        io.to(socket.id).emit('teamJoined', team);
        io.emit('updatedRooms', Object.keys(rooms));
    } else {
        socket.emit('roomNotFound');
    }
}

// Socket.IO logic for player joining and room creation
io.on('connection', (socket) => {
    socket.on('createRoom', ({ playerName }) => {
        const roomCode = generateRoomCode();
        rooms[roomCode] = [{ playerName, socketId: socket.id }];
        socket.join(roomCode);
        socket.emit('roomCreated', roomCode);
        io.emit('updatedRooms', Object.keys(rooms));
    });

    socket.on('joinRoom', ({ roomCode, playerName }) => {
        if (rooms[roomCode]) {
            rooms[roomCode].push({ playerName, socketId: socket.id });
            socket.join(roomCode);
            io.emit('updatedRooms', Object.keys(rooms));
        } else {
            socket.emit('roomNotFound');
        }
    });

    socket.on('joinTeam', ({ roomCode, playerName, team }) => {
        joinTeam(roomCode, playerName, team);
        io.to(socket.id).emit('teamJoined', team);
        io.emit('updatedRooms', Object.keys(rooms));
    });
    
});


function generateRoomCode() {
    const code = Math.floor(1000 + Math.random() * 9000);
    return code.toString();
}

// START THE SERVER
server.listen(port, () => {
    console.log(`The application started successfully on port ${port}`);
});
