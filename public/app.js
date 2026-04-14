const app = document.getElementById('app');

function showLogin() {
    app.innerHTML = `
        <h2>Login</h2>
        <input id="user" placeholder="Username">
        <input id="pass" type="password" placeholder="Password">
        <button onclick="login()">Login</button>
        <button onclick="showRegister()">Register</button>
    `;
}

function showRegister() {
    app.innerHTML = `
        <h2>Register</h2>
        <input id="user" placeholder="Username">
        <input id="pass" type="password" placeholder="Password">
        <button onclick="register()">Create</button>
        <button onclick="showLogin()">Back</button>
    `;
}

function showDashboard(user) {
    app.innerHTML = `
        <h2>Welcome ${user.username}</h2>
        <p>Credits: ${user.credits || 0}</p>

        <button onclick="loadPlayers()">View Players</button>
        <button onclick="enterTournament()">Enter Tournament</button>
        <button onclick="viewRunningTournaments()">View Running Tournaments</button>

        <hr>

        <button onclick="showStore()">Store</button>
        <button onclick="showDeck()">My Deck</button>
        <button onclick="showRanking()">Ranking</button>
    `;
}

async function register() {
    const username = user.value;
    const password = pass.value;

    const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    alert('User created!');
    showLogin();
}

async function login() {
    const username = user.value;
    const password = pass.value;

    const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.error) {
        alert(data.error);
    } else {
        window.currentUser = data;
        showDashboard(data);
    }
}

async function loadPlayers() {
    const res = await fetch('/players');
    const players = await res.json();

    app.innerHTML = `
        <h2>Players</h2>
        ${players.map(p => `<div>${p.username}</div>`).join('')}
        <button onclick="showDashboard(currentUser)">Back</button>
    `;
}

async function enterTournament() {
    // Get user's cards
    const res = await fetch(`/deck/${currentUser.id}`);
    const cards = await res.json();

    if (cards.length === 0) {
        alert('You have no cards in your deck!');
        return;
    }

    // Select card
    const cardOptions = cards.map(c => `${c.id}: ${c.name}`).join('\n');
    const selectedCardId = prompt(`Select a card:\n${cardOptions}`);
    const card = cards.find(c => c.id == selectedCardId);
    if (!card) return;

    // Select type
    const type = prompt('Select tournament type: beauty, charm, or kind');
    if (!['beauty', 'charm', 'kind'].includes(type)) {
        alert('Invalid type');
        return;
    }

    const enterRes = await fetch('/tournaments/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: currentUser.id, cardId: card.id, type })
    });

    const tournament = await enterRes.json();
    alert(tournament.status === 'active' ? 'Entered tournament!' : 'Waiting for opponent...');
    showDashboard(currentUser);
}

async function viewRunningTournaments() {
    const res = await fetch(`/tournaments/running?excludePlayerId=${currentUser.id}`);
    const tournaments = await res.json();

    app.innerHTML = `
        <h2>Running Tournaments</h2>
        ${tournaments.map(t => `
            <div style="border:1px solid #ccc; padding:10px; margin:10px;">
                <p>Type: ${t.type}</p>
                <button onclick="viewTournament(${t.id})">View & Vote</button>
            </div>
        `).join('')}
        <button onclick="showDashboard(currentUser)">Back</button>
    `;
}

async function viewTournament(tournamentId) {
    const res = await fetch(`/tournaments/${tournamentId}`);
    const tournament = await res.json();

    if (!tournament) return;

    // Get card details
    const cardsRes = await fetch('/store');
    const allCards = await cardsRes.json();
    const card1 = allCards.find(c => c.id == tournament.card1);
    const card2 = allCards.find(c => c.id == tournament.card2);

    app.innerHTML = `
        <h2>Tournament: ${tournament.type}</h2>
        <div class="tournament-view">
            <div>
                <img src="${card1.image}" width="150">
                <p><strong>${card1.name}</strong></p>
                <p>Beauty: ${card1.beauty}</p>
                <p>Charm: ${card1.charm}</p>
                <p>Kind: ${card1.kind}</p>
                <button onclick="voteOnTournament(${tournament.id}, ${tournament.card1})">Vote for this card</button>
            </div>
            <div>
                <img src="${card2.image}" width="150">
                <p><strong>${card2.name}</strong></p>
                <p>Beauty: ${card2.beauty}</p>
                <p>Charm: ${card2.charm}</p>
                <p>Kind: ${card2.kind}</p>
                <button onclick="voteOnTournament(${tournament.id}, ${tournament.card2})">Vote for this card</button>
            </div>
        </div>
        <button onclick="viewRunningTournaments()">Back</button>
    `;
}

async function voteOnTournament(tournamentId, votedCardId) {
    await fetch('/tournaments/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, voterId: currentUser.id, votedCardId })
    });
    alert('Vote submitted!');
    viewRunningTournaments();
}

async function showStore() {
    const res = await fetch('/store');
    const cards = await res.json();

    app.innerHTML = `
        <h2>Store</h2>
        ${cards.map(c => `
            <div>
                <img src="${c.image}" width="100">
                <p>${c.name} - ${c.price} credits</p>
                <button onclick="buy(${c.id})">Buy</button>
            </div>
        `).join('')}
        <button onclick="showDashboard(currentUser)">Back</button>
    `;
}

async function buy(cardId) {
    const res = await fetch('/store/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            playerId: currentUser.id,
            cardId
        })
    });

    const data = await res.json();

    if (data.error) alert(data.error);
    else {
        currentUser = data.player;
        alert('Card bought!');
        showStore();
    }
}

async function showDeck() {
    const res = await fetch(`/deck/${currentUser.id}`);
    const cards = await res.json();

    app.innerHTML = `
        <h2>Your Deck</h2>
        ${cards.map(c => `
            <div class="card">
                <img src="${c.image}" width="100" style="display:block;">
                <p><strong>${c.name}</strong></p>
                <p>Beauty: ${c.beauty}</p>
                <p>Charm: ${c.charm}</p>
                <p>Kind: ${c.kind}</p>
            </div>
        `).join('')}
        <br><button onclick="showDashboard(currentUser)">Back</button>
    `;
}

async function showRanking() {
    const res = await fetch('/ranking');
    const ranking = await res.json();

    app.innerHTML = `
        <h2>Ranking</h2>
        ${Object.entries(ranking).map(([id, wins]) => `
            <div>Player ${id} - Wins: ${wins}</div>
        `).join('')}
        <button onclick="showDashboard(currentUser)">Back</button>
    `;
}

// Initialize the app by showing the login screen
showLogin();