const express = require('express');
const router = express.Router();

const { read, write } = require('../services/storage');

const file = './data/cards.json';

// Get all cards
router.get('/', (req, res) => {
    const cards = read(file);
    res.json(cards);
});

// Create a new card
router.post('/', (req, res) => {
    const cards = read(file);

    const newCard = {
        id: Date.now(),
        name: req.body.name,
        image: req.body.image
    };

    cards.push(newCard);
    write(file, cards);

    res.json(newCard);
});

module.exports = router;