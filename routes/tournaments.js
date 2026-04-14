const express = require('express');
const router = express.Router();

const tournamentService = require('../services/tournamentService');

router.post('/enter', (req, res) => {
    const { playerId, cardId, type } = req.body;
    try {
        const tournament = tournamentService.enterTournament(playerId, cardId, type);
        res.json(tournament);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.get('/running', (req, res) => {
    const excludePlayerId = req.query.excludePlayerId;
    const tournaments = tournamentService.getRunningTournaments(excludePlayerId);
    res.json(tournaments);
});

router.post('/vote', (req, res) => {
    const { tournamentId, voterId, votedCardId } = req.body;
    tournamentService.vote(tournamentId, voterId, votedCardId);
    res.json({ success: true });
});

router.get('/:id', (req, res) => {
    const tournament = tournamentService.getTournamentDetails(req.params.id);
    if (tournament) res.json(tournament);
    else res.status(404).json({ error: 'Tournament not found' });
});

module.exports = router;