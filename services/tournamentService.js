const { read, write } = require('./storage');

const file = './data/tournaments.json';

function createTournament(player1, player2) {
    const tournaments = read(file);

    const newTournament = {
        id: Date.now(),
        players: [player1, player2],
        votes: []
    };

    tournaments.push(newTournament);
    write(file, tournaments);

    return newTournament;
}

module.exports = { createTournament };