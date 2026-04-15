const { read, write } = require('./storage');

const file = './data/farming.json';
const playersFile = './data/players.json';

function startFarming(playerId, cardId, duration) {
    const farmings = read(file);
    playerId = Number(playerId);
    cardId = Number(cardId);

    const durationMap = { 1: 3600000, 2: 7200000, 4: 14400000, 8: 28800000 };
    const rewardMap = { 1: 100, 2: 200, 4: 400, 8: 800 };

    if (!durationMap[duration]) {
        throw new Error('Invalid duration');
    }

    const existing = farmings.find(f => f.playerId === playerId && f.cardId === cardId);
    if (existing) {
        throw new Error('This card is already farming');
    }

    const endTime = Date.now() + durationMap[duration];
    const farming = {
        id: Date.now(),
        playerId,
        cardId,
        duration,
        reward: rewardMap[duration],
        startTime: Date.now(),
        endTime,
        status: 'active'
    };

    farmings.push(farming);
    write(file, farmings);
    return farming;
}

function getFarmingsByPlayer(playerId) {
    const farmings = read(file);
    playerId = Number(playerId);
    return farmings.filter(f => f.playerId === playerId && f.status === 'active');
}

function checkFarmingTimeouts() {
    const farmings = read(file);
    const players = read(playersFile);
    const now = Date.now();
    let changed = false;

    for (let i = farmings.length - 1; i >= 0; i--) {
        const f = farmings[i];
        if (f.status === 'active' && now >= f.endTime) {
            const player = players.find(p => p.id === f.playerId);
            if (player) {
                player.credits = (player.credits || 0) + f.reward;
            }
            f.status = 'finished';
            changed = true;
        }
    }

    if (changed) {
        write(playersFile, players);
        write(file, farmings);
    }
}

function isCardFarming(cardId) {
    const farmings = read(file);
    return farmings.some(f => f.cardId === cardId && f.status === 'active');
}

module.exports = { startFarming, getFarmingsByPlayer, checkFarmingTimeouts, isCardFarming };
