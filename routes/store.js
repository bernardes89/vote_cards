const express = require('express');
const router = express.Router();

const { read, write } = require('../services/storage');

const playersFile = './data/players.json';
const cardsFile = './data/cards.json';

// Get all cards (store)
router.get('/', (req, res) => {
    const cards = read(cardsFile);
    res.json(cards);
});

// Buy card
router.post('/buy', (req, res) => {
    const { playerId, cardId } = req.body;

    const players = read(playersFile);
    const cards = read(cardsFile);

    const player = players.find(p => p.id == playerId);
    const card = cards.find(c => c.id == cardId);

    if (!player || !card) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    if ((player.credits || 0) < card.price) {
        return res.status(400).json({ error: 'Not enough credits' });
    }

    player.credits -= card.price;
    player.cards.push(cardId);

    write(playersFile, players);

    res.json({ success: true, player });
});

module.exports = router;