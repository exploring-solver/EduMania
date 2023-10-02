const express = require('express');
const router = express.Router();

module.exports = (db) => {
    router.get('/random', (req, res) => {
        const query = 'SELECT * FROM questions ORDER BY RAND() LIMIT 1';
        db.query(query, (error, results) => {
            if (error) {
                console.error('Error fetching random question:', error);
                res.status(500).json({ error: 'An error occurred while fetching the question.' });
            } else {
                // Send the random question as a JSON response 
                res.json(results[0]);
            }
        });
    });

    router.post('/answer', (req, res) => {
        const { roomId, playerName, questionId, selectedOption } = req.body;
    
        // Check if the selected option is correct by querying the database
        const correctOptionQuery = 'SELECT correct_option FROM questions WHERE id = ?';
        db.query(correctOptionQuery, [questionId], (error, results) => {
            if (error) {
                console.error('Error fetching correct option:', error);
                res.status(500).json({ error: 'An error occurred while checking the answer.' });
            } else {
                const correctOption = results[0].correct_option;
                const isCorrect = selectedOption === correctOption;
    
                // Insert the player's answer into the player_answers table
                const insertAnswerQuery = 'INSERT INTO player_answers (room_id, player_name, question_id, selected_option, is_correct) VALUES (?, ?, ?, ?, ?)';
                db.query(insertAnswerQuery, [roomId, playerName, questionId, selectedOption, isCorrect], (error) => {
                    if (error) {
                        console.error('Error inserting player answer:', error);
                        res.status(500).json({ error: 'An error occurred while submitting the answer.' });
                    } else {
                        if (isCorrect) {
                            // Fetch the player's team name from the players table
                            const getPlayerTeamQuery = 'SELECT team_name FROM players WHERE room_id = ? AND player_name = ?';
                            db.query(getPlayerTeamQuery, [roomId, playerName], (teamError, teamResults) => {
                                if (teamError) {
                                    console.error('Error fetching player team:', teamError);
                                    // Handle error if needed
                                } else if (teamResults.length === 0) {
                                    console.error('Room ID not found or player not found in the specified room.');
                                } else {
                                    const playerTeam = teamResults[0].team_name;
    
                                    // Determine the correct column to update based on the player's team
                                    const columnToUpdate = (playerTeam === 'red') ? 'team_red_score' : 'team_blue_score';
    
                                    // Update the team's score in the game_scores table
                                    const updateScoreQuery = `UPDATE game_scores SET ${columnToUpdate} = ${columnToUpdate} + 1 WHERE room_id = ?`;
                                    db.query(updateScoreQuery, [roomId], (updateError, updateResults) => {
                                        if (updateError) {
                                            console.error('Error updating team score:', updateError);
                                            // Handle error if needed
                                        } else {
                                            console.log('Team score updated successfully.');
                                            // Handle success if needed
                                        }
                                    });
                                }
                            });
                            
                            res.json({ message: 'Correct answer submitted.' });
                        } else {
                            res.json({ message: 'Incorrect answer submitted.' });
                        }
                    }
                });
            }
        });
    });
    


    return router;
};
