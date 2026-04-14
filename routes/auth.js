const express = require('express');
const router = express.Router();

const authService = require('../services/authService');

router.post('/register', (req, res) => {
    try {
        const user = authService.register(req.body.username, req.body.password, req.body.avatar);
        res.json(user);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

router.post('/login', (req, res) => {
    try {
        const user = authService.login(req.body.username, req.body.password);
        res.json(user);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

module.exports = router;