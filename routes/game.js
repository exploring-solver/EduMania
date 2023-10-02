const express = require('express');
const router = express.Router();
const { generateRoomId } = require('./utils');
const mysql = require('mysql2'); // Import the mysql module

module.exports = (db, rooms) => {
    const defaultTeams = ['Red', 'Blue'];
    router.put('/createroom', (req, res) => {
        const playerName = req.body.playerName;
        const roomId = generateRoomId();
    
        // Create a new room and assign the creator to it
        rooms[roomId] = { creator: playerName, players: [playerName] };
    
        // Insert the room information into the database
        db.query('INSERT INTO rooms (room_id, creator_name, players_count) VALUES (?, ?, ?)', [roomId, playerName, 1], (error, results) => {
            if (error) {
                console.error('Error inserting room into database:', error);
                res.status(500).json({ error: 'An error occurred while creating the room.' });
                return;
            }
    
            // Insert the creator player into the players table
            db.query('INSERT INTO players (room_id, player_name, joined_at) VALUES (?, ?, NOW())', [roomId, playerName], (playerInsertError, playerInsertResults) => {
                if (playerInsertError) {
                    console.error('Error inserting creator player into players table:', playerInsertError);
                    res.status(500).json({ error: 'An error occurred while creating the room.' });
                    return;
                }
    
                // Insert a new entry into the game_scores table for the room
                db.query('INSERT INTO game_scores (room_id, team_red_score, team_blue_score) VALUES (?, ?, ?)', [roomId, 0, 0], (gameScoresInsertError, gameScoresInsertResults) => {
                    if (gameScoresInsertError) {
                        console.error('Error inserting game scores:', gameScoresInsertError);
                        res.status(500).json({ error: 'An error occurred while creating the room.' });
                        return;
                    }
                    
                    // Respond with the created room ID and redirect
                    res.redirect(`/games/${roomId}`);
                });
            });
        });
    });
    
    router.put('/joinroom/:roomId', (req, res) => {
        const roomId = req.params.roomId;
        const playerName = req.body.playerName;

        // Fetch the current players_count from the rooms table
        db.query('SELECT players_count FROM rooms WHERE room_id = ?', [roomId], (error, results) => {
            if (error) {
                console.error('Error fetching players count:', error);
                res.redirect('/');
                return;
            }

            if (results && results.length > 0) {
                const currentPlayersCount = results[0].players_count;

                if (currentPlayersCount <= 10) {
                    // Increment the players_count and update the room in the database
                    const updatedPlayersCount = currentPlayersCount + 1;
                    db.query('UPDATE rooms SET players_count = ? WHERE room_id = ?', [updatedPlayersCount, roomId], (updateError, updateResults) => {
                        if (updateError) {
                            console.error('Error updating players count:', updateError);
                            res.redirect('/');
                            return;
                        }

                        // Add the player to the players table
                        db.query('INSERT INTO players (room_id, player_name, joined_at) VALUES (?, ?, NOW())', [roomId, playerName], (insertError, insertResults) => {
                            if (insertError) {
                                console.error('Error inserting player into players table:', insertError);
                                res.redirect('/');
                                return;
                            }

                            // Redirect the player to the game board with the room ID
                            res.redirect(`/games/${roomId}`);
                        });
                    });
                } else {
                    // Handle room full
                    res.redirect('/');
                }
            } else {
                // Handle incorrect or nonexistent room ID
                console.error('Invalid room ID:', roomId);
                res.redirect('/');
            }
        });
    });


    // Endpoint to join a team
    router.post('/jointeam/:roomId', (req, res) => {
        const roomId = req.params.roomId;
        const playerName = req.body.playerName;
        const teamName = req.body.teamName; // Team name should be one of the defaultTeams

        // Check if the team name is valid (red or blue)
        if (!['red', 'blue'].includes(teamName)) {
            return res.status(400).json({ error: 'Invalid team name' });
        }

        // Fetch the room to ensure it exists
        db.query('SELECT * FROM rooms WHERE room_id = ?', [roomId], (roomError, roomResults) => {
            if (roomError) {
                console.error('Error fetching room:', roomError);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (roomResults.length === 0) {
                return res.status(404).json({ error: 'Room not found' });
            }

            // Update player's team in the players table
            const updateTeamQuery = 'UPDATE players SET team_name = ? WHERE room_id = ? AND player_name = ?';
            db.query(updateTeamQuery, [teamName, roomId, playerName], (updateError, updateResults) => {
                if (updateError) {
                    console.error('Error updating player team:', updateError);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                if (updateResults.affectedRows === 0) {
                    return res.status(404).json({ error: 'Player not found' });
                }

                return res.status(200).json({ message: 'Player successfully joined the team' });
            });
        });
    });



    return router;
};