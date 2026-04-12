const { read, write } = require('./storage');

const file = './data/players.json';

function getAll() {
    return read(file);
}

function create(username) {
    const players = read(file);

    const newPlayer = {
        id: Date.now(),
        username,
        deck: []
    };

    players.push(newPlayer);
    write(file, players);

    return newPlayer;
}

module.exports = { getAll, create };