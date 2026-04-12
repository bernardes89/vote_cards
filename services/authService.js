const { read, write } = require('./storage');

const file = './data/players.json';

function register(username, password) {
    const players = read(file);

    if (players.find(p => p.username === username)) {
        throw new Error('User already exists');
    }

    const newUser = {
        id: Date.now(),
        username,
        password,
        deck: []
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

    return user;
}

module.exports = { register, login };