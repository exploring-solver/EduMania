const express = require('express');
const app = express();
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { getGameDataFromBackend } = require('./routes/utils');

app.use(express.json());
app.use(cors());
app.use(cookieParser());

// socket.io setup
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'hbs')

const port = 3000
const db = require('./db');

const rooms = {}; // This object will hold room-related data

// Import and use socketHandlers
const socketHandlers = require('./sockets/socketHandlers');
socketHandlers(io, rooms, db);

// Routes
// const indexRoutes = require('./routes/index');
const gameRoutes = require('./routes/game')(db , rooms);
const questionRoutes = require('./routes/questions')(db,rooms);
// app.use('/', indexRoutes);
app.put('/', (req, res) => {
    res.render('index');
}); 
app.get('/', (req, res) => {
    res.render('index');
});


app.get('/games/:roomId', async (req, res) => {
    const roomId = req.params.roomId;

    try {
        // Fetch game-related data from your backend based on roomId
        const gameData = await getGameDataFromBackend(roomId); // Implement this function

        if (gameData) {
            res.render('game', { roomId, teams: gameData.teams, currentQuestion: gameData.currentQuestion }); // Pass roomId and gameData to template
        } else {
            // Handle invalid room ID or no game data
            res.redirect('/');
        }
    } catch (error) {
        console.error('Error fetching game data:', error);
        res.redirect('/');
    }
});

app.use('/game', gameRoutes); 
app.use('/question' , questionRoutes); 

// START THE SERVER
server.listen(port, () => {
    console.log(`The application started successfully on port ${port}`);
});