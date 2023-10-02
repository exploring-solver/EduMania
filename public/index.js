// Connect to the server using Socket.IO
const socket = io();

let countdownInterval;

// Listen for the "timer" event
socket.on('timer', (data) => {
  const countdownElement = document.getElementById('countdown');
  const questionElement = document.getElementById('question');

  let remainingTime = data.duration;

  // Display the countdown on the client UI
  countdownInterval = setInterval(() => {
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    countdownElement.textContent = `${minutes}:${seconds}`;
    remainingTime -= 1000;

    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      countdownElement.textContent = 'Time\'s up!';
      questionElement.textContent = 'Waiting for the next question...';

      // Emit an event to request the next question
      socket.emit('requestNextQuestion');
    }
  }, 1000);
});

// Listen for the "time-up" event
socket.on('time-up', () => {
  // Handle time's up scenario on the client
  // For example, disable answer submission
});

// Listen for the "showNextQuestion" event
socket.on('showNextQuestion', () => {
  const questionElement = document.getElementById('question');
  questionElement.textContent = 'Next question is coming up...';

  // Display a brief delay before showing the next question
  setTimeout(() => {
    questionElement.textContent = ''; // Clear the message
    socket.emit('startNextQuestionTimer'); // Start the timer for the next question
  }, 3000); // 3 seconds delay
});

// Listen for the "startGame" event
socket.on('startGame', () => {
  // Start the first question timer when the game starts
  socket.emit('startNextQuestionTimer');
});

// Listen for the "roomCreated" event
socket.on('roomCreated', (data) => {
  const roomId = data.roomId;

  // Redirect to the game room with the provided room ID
  window.location.href = `/games/${roomId}`;
});


// Listen for the "gameOver" event
socket.on('gameOver', () => {
  // Handle the end of the game
});

socket.on('playerJoined', (playerName) => {
  // Update UI to show player joining
});

socket.on('answerSubmitted', (updatedGameData) => {
  // Update UI with the updated game data after an answer is submitted
});






const createRoomAndRedirect = async () => {
  try {
    const playerName = document.querySelector('#playerName').value;
    const response = await fetch('/game/createroom', {
      method: 'PUT', // Use 'POST' to create a new room
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerName }),
    });

    if (!response.ok) {
      throw new Error('Failed to create room. Please try again later.');
    }

    // Redirect to the created game room based on the server's redirection
    window.location.href = response.url;
  } catch (error) {
    console.error('Error creating room:', error);
    // You can display an error message to the user if needed.
  }
};

const createButton = document.querySelector('.create-button');
createButton.addEventListener('click', createRoomAndRedirect);