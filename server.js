const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/players', require('./routes/players'));
app.use('/cards', require('./routes/cards'));
app.use('/tournaments', require('./routes/tournaments'));
app.use('/votes', require('./routes/votes'));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});