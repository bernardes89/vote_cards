const express = require('express');
const router = express.Router();

const playerService = require('../services/playerService');

router.get('/', (req, res) => {
    res.json(playerService.getAll());
});

router.get('/:id', (req, res) => {
    const player = playerService.getById(req.params.id);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player);
});

router.put('/:id', (req, res) => {
    const updates = {};
    if (req.body.username !== undefined) updates.username = req.body.username;
    if (req.body.password !== undefined) updates.password = req.body.password;
    if (req.body.avatar !== undefined) updates.avatar = req.body.avatar;

    const player = playerService.update(req.params.id, updates);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player);
});

module.exports = router;