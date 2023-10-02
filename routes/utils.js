const db = require('../db'); // Import your database connection

async function getGameDataFromBackend(roomId) {
    try {
        // Fetch room information
        const roomQuery = 'SELECT * FROM rooms WHERE room_id = ?';
        const [roomData] = await db.promise().query(roomQuery, [roomId]);

        // Fetch player information
        const playerQuery = 'SELECT * FROM players WHERE room_id = ?';
        const [playerData] = await db.promise().query(playerQuery, [roomId]);

        // Fetch game scores
        const scoresQuery = 'SELECT * FROM game_scores WHERE room_id = ?';
        const [scoresData] = await db.promise().query(scoresQuery, [roomId]);

        // Fetch questions for the game
        const questionsQuery = 'SELECT * FROM questions';
        const [questionsData] = await db.promise().query(questionsQuery);

        // Fetch player answers
        const playerAnswersQuery = 'SELECT * FROM player_answers WHERE room_id = ?';
        const [playerAnswersData] = await db.promise().query(playerAnswersQuery, [roomId]);

        // Construct and return game data object
        const gameData = {
            room: roomData,
            players: playerData,
            scores: scoresData,
            questions: questionsData,
            playerAnswers: playerAnswersData,
        };

        return gameData;
    } catch (error) {
        throw error;
    }
}

// Handle when a question starts
function startQuestionTimer(roomId) {
    // Set a 2.5-minute (150 seconds) timer
    const timerDuration = 150 * 1000;

    // Emit the "timer" event to start the countdown
    io.to(roomId).emit('timer', { duration: timerDuration });

    // When the timer reaches 0, emit the "time-up" event
    setTimeout(() => {
        io.to(roomId).emit('time-up');
    }, timerDuration);
}


function generateRoomId() {
    const code = Math.floor(1000 + Math.random() * 9000);
    return code.toString();
}

module.exports = {
    getGameDataFromBackend,
    generateRoomId,
    startQuestionTimer

};