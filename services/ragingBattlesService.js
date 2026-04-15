const { read, write } = require('./storage');

const file = './data/ragingBattles.json';
const playersFile = './data/players.json';

function enterRagingBattle(playerId, cardId) {
    const battles = read(file);
    playerId = Number(playerId);
    cardId = Number(cardId);

    let battle = battles.find(b => b.status === 'waiting' && b.player1 !== playerId);

    if (!battle) {
        battle = {
            id: Date.now(),
            player1: playerId,
            card1: cardId,
            player2: null,
            card2: null,
            startTime: Date.now(),
            endTime: Date.now() + 5 * 60 * 1000,
            status: 'waiting',
            winner: null,
            winnerCredits: 0,
            loserCredits: 0
        };
        battles.push(battle);
    } else {
        battle.player2 = playerId;
        battle.card2 = cardId;
        battle.status = 'active';
        finishBattle(battle);
    }

    write(file, battles);
    return battle;
}

function finishBattle(battle) {
    const cardsFile = require('./storage').read('./data/cards.json');
    const card1 = cardsFile.find(c => c.id == battle.card1);
    const card2 = cardsFile.find(c => c.id == battle.card2);

    if (!card1 || !card2) return;

    const sum1 = (card1.beauty || 0) + (card1.charm || 0) + (card1.kind || 0);
    const sum2 = (card2.beauty || 0) + (card2.charm || 0) + (card2.kind || 0);

    if (sum1 > sum2) {
        battle.winner = battle.player1;
        battle.winnerCredits = 100;
        battle.loserCredits = -100;
    } else if (sum2 > sum1) {
        battle.winner = battle.player2;
        battle.winnerCredits = 100;
        battle.loserCredits = -100;
    } else {
        battle.winner = null;
        battle.winnerCredits = 0;
        battle.loserCredits = 0;
    }

    battle.status = 'finished';
}

function getRagingBattles() {
    const battles = read(file);
    return battles.filter(b => b.status === 'active' || b.status === 'waiting');
}

function getFinishedRagingBattles() {
    const battles = read(file);
    return battles.filter(b => b.status === 'finished');
}

function checkBattleTimeouts() {
    const battles = read(file);
    const players = read(playersFile);
    const now = Date.now();
    let changed = false;

    for (let i = 0; i < battles.length; i++) {
        const b = battles[i];
        if (b.status === 'waiting' && now >= b.endTime) {
            battles.splice(i, 1);
            changed = true;
            i--;
        } else if (b.status === 'active' && !battles[i].winner) {
            finishBattle(b);
            if (b.winner) {
                const winner = players.find(p => p.id === b.winner);
                const loser = players.find(p => p.id === (b.winner === b.player1 ? b.player2 : b.player1));
                if (winner) {
                    winner.credits = (winner.credits || 0) + 100;
                    winner.ragingWins = (winner.ragingWins || 0) + 1;
                }
                if (loser) {
                    loser.credits = (loser.credits || 0) - 100;
                    loser.ragingLosses = (loser.ragingLosses || 0) + 1;
                }
            }
            changed = true;
        }
    }

    if (changed) {
        write(playersFile, players);
        write(file, battles);
    }
}

function isCardInBattle(cardId) {
    const battles = read(file);
    return battles.some(b => (b.card1 === cardId || b.card2 === cardId) && (b.status === 'active' || b.status === 'waiting'));
}

module.exports = { enterRagingBattle, getRagingBattles, getFinishedRagingBattles, checkBattleTimeouts, isCardInBattle };
