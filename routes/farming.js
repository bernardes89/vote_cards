const express = require('express');
const router = express.Router();

const farmingService = require('../services/farmingService');
const tournamentService = require('../services/tournamentService');
const ragingBattlesService = require('../services/ragingBattlesService');
const { read, write } = require('../services/storage');

router.post('/start', (req, res) => {
    const { playerId, cardId, duration } = req.body;
    try {
        if (tournamentService.isCardInTournament(cardId)) {
            return res.status(400).json({ error: 'Card is participating in a tournament' });
        }
        if (ragingBattlesService.isCardInBattle(cardId)) {
            return res.status(400).json({ error: 'Card is in a raging battle' });
        }
        const farming = farmingService.startFarming(playerId, cardId, duration);
        res.json(farming);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.get('/player/:playerId', (req, res) => {
    const farmings = farmingService.getFarmingsByPlayer(req.params.playerId);
    res.json(farmings);
});

router.post('/complete', (req, res) => {
    const { farmId } = req.body;
    try {
        const farmings = read('./data/farming.json');
        const farming = farmings.find(f => f.id == farmId);
        
        if (!farming) {
            return res.status(404).json({ error: 'Farming not found' });
        }

        // Award credits to player
        const players = read('./data/players.json');
        const player = players.find(p => p.id == farming.playerId);
        
        if (player) {
            player.credits = (player.credits || 0) + farming.reward;
            write('./data/players.json', players);
        }

        // Remove farming record
        const updatedFarmings = farmings.filter(f => f.id != farmId);
        write('./data/farming.json', updatedFarmings);

        res.json({ success: true, reward: farming.reward });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

module.exports = router;
