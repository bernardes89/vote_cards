const express = require('express');
const router = express.Router();

const { read } = require('../services/storage');

router.get('/', (req, res) => {
    const players = read('./data/players.json');

    const ranking = players.map(p => ({
        id: p.id,
        username: p.username,
        credits: p.credits || 0,
        wins: p.wins || 0,
        losses: p.losses || 0,
        avatar: p.avatar || ''
    }));

    ranking.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.losses - b.losses;
    });

    res.json(ranking);
});

module.exports = router;