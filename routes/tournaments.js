const express = require('express');
const router = express.Router();

const tournamentService = require('../services/tournamentService');

router.post('/', (req, res) => {
    const { player1, player2 } = req.body;
    const tournament = tournamentService.createTournament(player1, player2);
    res.json(tournament);
});

module.exports = router;