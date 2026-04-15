const express = require('express');
const router = express.Router();

const { read } = require('../services/storage');

router.get('/', (req, res) => {
    const players = read('./data/players.json');

    const ranking = players.map(p => ({
        id: p.id,
        username: p.username,
        avatar: p.avatar || '',
        tournamentWins: p.wins || 0,
        tournamentLosses: p.losses || 0,
        ragingWins: p.ragingWins || 0,
        ragingLosses: p.ragingLosses || 0
    }));

    ranking.forEach(p => {
        p.totalWins = p.tournamentWins + p.ragingWins;
        p.totalLosses = p.tournamentLosses + p.ragingLosses;
    });

    ranking.sort((a, b) => {
        if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
        return a.totalLosses - b.totalLosses;
    });

    res.json(ranking);
});

module.exports = router;