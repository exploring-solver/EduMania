document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // Function to create a room
    const createRoom = (playerName) => {
        socket.emit('createRoom', { playerName });
    };

    // Function to join a room
    const joinRoom = (roomCode, playerName) => {
        socket.emit('joinRoom', { roomCode, playerName });
    };

    // Function to join a team
    const joinTeam = (roomCode, playerName, team) => {
        socket.emit('joinTeam', { roomCode, playerName, team });
    };

    // Listen for room creation
    socket.on('roomCreated', (roomCode) => {
        alert(`Room created with code: ${roomCode}`);
        // Redirect or update UI as needed
    });

    // Listen for joined room
    socket.on('joinedRoom', (roomCode) => {
        alert(`Joined room with code: ${roomCode}`);
        // Redirect or update UI as needed
    });

    // Listen for updated room list
    socket.on('updatedRooms', (roomList) => {
        // Update UI with room list
        console.log('Updated room list:', roomList);
    });

    // Listen for room not found
    socket.on('roomNotFound', () => {
        alert('Room not found.');
    });

    // Listen for team joined
    socket.on('teamJoined', (team) => {
        alert(`Joined team: ${team}`);
        // Update UI or perform other actions as needed
    });

    // Add event listeners to your "Create" and "Join" buttons
    const createButton = document.querySelector('.create-button');
    const joinButton = document.querySelector('.join-button');
    const joinTeamButtons = document.querySelectorAll('.join-team');

    createButton.addEventListener('click', () => {
        const playerName = prompt('Enter your name:');
        if (playerName) {
            createRoom(playerName);
        }
    });

    joinButton.addEventListener('click', () => {
        const roomCode = prompt('Enter room code:');
        if (roomCode) {
            const playerName = prompt('Enter your name:');
            if (playerName) {
                joinRoom(roomCode, playerName);
            }
        }
    });

    joinTeamButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const team = button.dataset.team;
            const playerName = prompt('Enter your name:');
            if (playerName) {
                joinTeam(roomCode, playerName, team);
            }
        });
    });
});
