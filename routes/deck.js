const express = require('express');
const router = express.Router();

const { read } = require('../services/storage');

const playersFile = './data/players.json';
const cardsFile = './data/cards.json';

router.get('/:playerId', (req, res) => {
    const players = read(playersFile);
    const cards = read(cardsFile);

    const player = players.find(p => p.id == req.params.playerId);

    const playerCards = cards.filter(c => player.cards.includes(c.id));

    res.json(playerCards);
});

module.exports = router;