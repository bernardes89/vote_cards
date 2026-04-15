const express = require('express');
const router = express.Router();

const ragingBattlesService = require('../services/ragingBattlesService');
const tournamentService = require('../services/tournamentService');
const farmingService = require('../services/farmingService');

router.post('/enter', (req, res) => {
    const { playerId, cardId } = req.body;
    try {
        if (tournamentService.isCardInTournament(cardId)) {
            return res.status(400).json({ error: 'Card is participating in a tournament' });
        }
        if (farmingService.isCardFarming(cardId)) {
            return res.status(400).json({ error: 'Card is farming' });
        }
        const battle = ragingBattlesService.enterRagingBattle(playerId, cardId);
        res.json(battle);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.get('/active', (req, res) => {
    const battles = ragingBattlesService.getRagingBattles();
    res.json(battles);
});

router.get('/finished', (req, res) => {
    const battles = ragingBattlesService.getFinishedRagingBattles();
    res.json(battles);
});

module.exports = router;
