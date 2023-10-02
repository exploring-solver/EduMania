const { generateRoomId, getPlayerName } = require('../routes/utils');

module.exports = (io, rooms, db) => {
  io.on('connection', (socket) => {
    // Listen for socket connection
    
    socket.on('disconnect', () => {
      // Handle disconnection if needed
    });

    // Example: Listen for a custom 'startGame' event
    socket.on('startGame', (roomId) => {
      // Handle starting the game logic here
      // You can emit events to start the game, set up timers, etc.
    });

    // Example: Listen for a custom 'answerQuestion' event
    socket.on('answerQuestion', (data) => {
      // Handle logic for processing the player's answer here
      // You can check if the answer is correct, update scores, emit results, etc.
    });

    // You can add more custom events and logic as needed
  });
};
