const express = require('express');
const router = express.Router();

const { read } = require('../services/storage');

router.get('/', (req, res) => {
    const tournaments = read('./data/tournaments.json');

    const ranking = {};

    tournaments.forEach(t => {
        if (t.winner) {
            ranking[t.winner] = (ranking[t.winner] || 0) + 1;
        }
    });

    res.json(ranking);
});

module.exports = router;