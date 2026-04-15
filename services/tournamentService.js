const { read, write } = require('./storage');

const file = './data/tournaments.json';

function enterTournament(playerId, cardId, type) {
    const tournaments = read(file);
    playerId = Number(playerId);
    cardId = Number(cardId);

    // Find pending tournament of same type that does not already include this player
    let tournament = tournaments.find(t => t.status === 'pending' && t.type === type && t.player1 !== playerId);

    if (!tournament) {
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
            status: 'pending',
            winner: null
        };
        tournaments.push(tournament);
    } else {
        tournament.player2 = playerId;
        tournament.card2 = cardId;
        tournament.status = 'active';
        tournament.endTime = Date.now() + 4 * 60 * 1000;
    }

    write(file, tournaments);
    return tournament;
}

function getRunningTournaments(excludePlayerId) {
    const tournaments = read(file);
    excludePlayerId = Number(excludePlayerId);
    return tournaments.filter(t =>
        t.status === 'active' &&
        t.player1 !== excludePlayerId &&
        t.player2 !== excludePlayerId
    );
}

function getTournamentsByPlayer(playerId) {
    const tournaments = read(file);
    playerId = Number(playerId);
    return tournaments.filter(t =>
        t.status === 'active' &&
        (t.player1 === playerId || t.player2 === playerId)
    );
}

function getFinishedTournaments() {
    const tournaments = read(file);
    return tournaments.filter(t => t.status === 'finished');
}

function vote(tournamentId, voterId, votedCardId) {
    const tournaments = read(file);
    const tournament = tournaments.find(t => t.id == tournamentId);
    if (!tournament) {
        return { error: 'Tournament not found' };
    }
    if (tournament.status !== 'active') {
        return { error: 'Tournament is not active' };
    }
    voterId = Number(voterId);
    if ([tournament.player1, tournament.player2].includes(voterId)) {
        return { error: 'Participants cannot vote in their own tournament' };
    }
    if (![tournament.card1, tournament.card2].includes(votedCardId)) {
        return { error: 'Invalid vote selection' };
    }
    if (tournament.votes.some(v => v.voterId == voterId)) {
        return { error: 'You have already voted' };
    }
    tournament.votes.push({ voterId, votedCardId });
    write(file, tournaments);
    return { success: true };
}

function getTournamentDetails(tournamentId) {
    const tournaments = read(file);
    return tournaments.find(t => t.id == tournamentId);
}

function isCardInTournament(cardId) {
    const tournaments = read(file);
    return tournaments.some(t => 
        (t.card1 === cardId || t.card2 === cardId) && 
        (t.status === 'active' || t.status === 'pending')
    );
}

function checkTimeouts() {
    const tournaments = read(file);
    const now = Date.now();
    let changed = false;

    for (let i = tournaments.length - 1; i >= 0; i--) {
        const t = tournaments[i];
        if (t.status === 'pending' && now - t.startTime > 5 * 60 * 1000) {
            // 1-player timeout: move to finished without recording win/loss
            t.status = 'finished';
            t.winner = null;
            changed = true;
        } else if (t.status === 'active' && now > t.endTime) {
            // 2-player tournament: determine winner by votes
            const votes1 = t.votes.filter(v => v.votedCardId == t.card1).length;
            const votes2 = t.votes.filter(v => v.votedCardId == t.card2).length;
            if (votes1 > votes2) {
                t.winner = t.player1;
                updatePlayerRecord(t.player1, t.player2);
            } else if (votes2 > votes1) {
                t.winner = t.player2;
                updatePlayerRecord(t.player2, t.player1);
            } else {
                t.winner = null;
            }
            t.status = 'finished';
            changed = true;
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

function updatePlayerRecord(winnerId, loserId) {
    const players = read('./data/players.json');
    const winner = players.find(p => p.id == winnerId);
    const loser = players.find(p => p.id == loserId);

    if (winner) {
        winner.wins = (winner.wins || 0) + 1;
    }
    if (loser) {
        loser.losses = (loser.losses || 0) + 1;
    }
    write('./data/players.json', players);
}

module.exports = { enterTournament, getRunningTournaments, getTournamentsByPlayer, getFinishedTournaments, vote, getTournamentDetails, checkTimeouts, isCardInTournament };