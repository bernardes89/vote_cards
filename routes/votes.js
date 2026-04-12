const express = require('express');
const router = express.Router();

const { read, write } = require('../services/storage');

const file = './data/votes.json';

router.post('/', (req, res) => {
    const votes = read(file);

    votes.push(req.body);

    write(file, votes);

    res.json({ success: true });
});

module.exports = router;