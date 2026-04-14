const { read, write } = require('./storage');

const file = './data/players.json';

function getAll() {
    return read(file);
}

function getById(id) {
    const players = read(file);
    return players.find(p => p.id == id);
}

function create(username, password) {
    const players = read(file);

    const newPlayer = {
        id: Date.now(),
        username,
        password,
        credits: 1000,
        cards: [],
        wins: 0,
        losses: 0,
        avatar: ''
    };

    players.push(newPlayer);
    write(file, players);

    return newPlayer;
}

function update(id, updates) {
    const players = read(file);
    const player = players.find(p => p.id == id);
    if (!player) return null;

    if (updates.username !== undefined) player.username = updates.username;
    if (updates.password !== undefined) player.password = updates.password;
    if (updates.avatar !== undefined) player.avatar = updates.avatar;
    if (updates.credits !== undefined) player.credits = updates.credits;
    if (updates.wins !== undefined) player.wins = updates.wins;
    if (updates.losses !== undefined) player.losses = updates.losses;
    if (updates.cards !== undefined) player.cards = updates.cards;

    write(file, players);
    return player;
}

module.exports = { getAll, getById, create, update };