const express = require('express');
const router = express.Router();

const playerService = require('../services/playerService');

router.get('/', (req, res) => {
    res.json(playerService.getAll());
});

router.post('/', (req, res) => {
    const { username } = req.body;
    const player = playerService.create(username);
    res.json(player);
});

module.exports = router;