const { read, write } = require('./storage');

const file = './data/tournaments.json';

function enterTournament(playerId, cardId, type) {
    const tournaments = read(file);

    // Find pending tournament of same type
    let tournament = tournaments.find(t => t.status === 'pending' && t.type === type);

    if (!tournament) {
        // Create new
        tournament = {
            id: Date.now(),
            type,
            player1: playerId,
            card1: cardId,
            player2: null,
            card2: null,
            startTime: Date.now(),
            endTime: null,
            votes: [],
            status: 'pending'
        };
        tournaments.push(tournament);
    } else {
        // Join existing
        tournament.player2 = playerId;
        tournament.card2 = cardId;
        tournament.status = 'active';
        tournament.endTime = Date.now() + 4 * 60 * 1000; // 4 min
    }

    write(file, tournaments);
    return tournament;
}

function getRunningTournaments(excludePlayerId) {
    const tournaments = read(file);
    return tournaments.filter(t => t.status === 'active' && t.player1 !== excludePlayerId && t.player2 !== excludePlayerId);
}

function vote(tournamentId, voterId, votedCardId) {
    const tournaments = read(file);
    const tournament = tournaments.find(t => t.id == tournamentId);
    if (!tournament || tournament.status !== 'active') return;

    // Check if already voted
    if (tournament.votes.some(v => v.voterId == voterId)) return;

    tournament.votes.push({ voterId, votedCardId });
    write(file, tournaments);
}

function getTournamentDetails(tournamentId) {
    const tournaments = read(file);
    return tournaments.find(t => t.id == tournamentId);
}

function checkTimeouts() {
    const tournaments = read(file);
    const now = Date.now();
    let changed = false;

    for (let i = tournaments.length - 1; i >= 0; i--) {
        const t = tournaments[i];
        if (t.status === 'pending' && now - t.startTime > 5 * 60 * 1000) {
            // Remove pending after 5 min
            tournaments.splice(i, 1);
            changed = true;
        } else if (t.status === 'active' && now > t.endTime) {
            // Finish active
            const votes1 = t.votes.filter(v => v.votedCardId == t.card1).length;
            const votes2 = t.votes.filter(v => v.votedCardId == t.card2).length;
            if (votes1 > votes2) {
                t.winner = t.player1;
            } else if (votes2 > votes1) {
                t.winner = t.player2;
            } else {
                t.winner = null; // tie
            }
            t.status = 'finished';
            changed = true;
            // Award credits if winner
            if (t.winner) {
                awardCredits(t.winner, 1000);
            }
        }
    }

    if (changed) write(file, tournaments);
}

function awardCredits(playerId, amount) {
    const players = read('./data/players.json');
    const player = players.find(p => p.id == playerId);
    if (player) {
        player.credits = (player.credits || 0) + amount;
        write('./data/players.json', players);
    }
}

module.exports = { enterTournament, getRunningTournaments, vote, getTournamentDetails, checkTimeouts };