const { read, write } = require('./storage');

const file = './data/players.json';

function normalizePlayer(player) {
    let changed = false;
    if (player.credits === undefined) {
        player.credits = 1000;
        changed = true;
    }
    if (!Array.isArray(player.cards)) {
        player.cards = [];
        changed = true;
    }
    if (player.wins === undefined) {
        player.wins = 0;
        changed = true;
    }
    if (player.losses === undefined) {
        player.losses = 0;
        changed = true;
    }
    if (player.ragingWins === undefined) {
        player.ragingWins = 0;
        changed = true;
    }
    if (player.ragingLosses === undefined) {
        player.ragingLosses = 0;
        changed = true;
    }
    if (player.avatar === undefined) {
        player.avatar = '';
        changed = true;
    }
    return changed;
}

function register(username, password, avatar = '') {
    const players = read(file);

    if (players.find(p => p.username === username)) {
        throw new Error('User already exists');
    }

    const newUser = {
        id: Date.now(),
        username,
        password,
        credits: 1000,
        cards: [],
        wins: 0,
        losses: 0,
        ragingWins: 0,
        ragingLosses: 0,
        avatar: avatar || ''
    };

    players.push(newUser);
    write(file, players);

    return newUser;
}

function login(username, password) {
    const players = read(file);

    const user = players.find(
        p => p.username === username && p.password === password
    );

    if (!user) throw new Error('Invalid credentials');

    if (normalizePlayer(user)) {
        write(file, players);
    }

    return user;
}

module.exports = { register, login };