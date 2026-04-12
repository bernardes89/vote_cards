const express = require('express');
const router = express.Router();

const { read, write } = require('../services/storage');

const votesFile = './data/votes.json';
const tournamentsFile = './data/tournaments.json';

router.post('/', (req, res) => {
    const votes = read(votesFile);
    const tournaments = read(tournamentsFile);

    const { tournamentId, playerId } = req.body;

    votes.push({ tournamentId, playerId });
    write(votesFile, votes);

    // COUNT VOTES
    const tournamentVotes = votes.filter(v => v.tournamentId == tournamentId);

    const count = {};

    tournamentVotes.forEach(v => {
        count[v.playerId] = (count[v.playerId] || 0) + 1;
    });

    let winner = null;
    let max = 0;

    for (let p in count) {
        if (count[p] > max) {
            max = count[p];
            winner = p;
        }
    }

    const tournament = tournaments.find(t => t.id == tournamentId);
    tournament.winner = winner;

    write(tournamentsFile, tournaments);

    res.json({ winner });
});

module.exports = router;