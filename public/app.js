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

        <button onclick="loadPlayers()">View Players</button>
        <button onclick="createTournament()">Create Tournament</button>
        <button onclick="loadTournaments()">View Tournaments</button>

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

async function createTournament() {
    const p1 = prompt('Player 1 ID');
    const p2 = prompt('Player 2 ID');

    await fetch('/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player1: p1, player2: p2 })
    });

    alert('Tournament created!');
}

async function loadTournaments() {
    const res = await fetch('/tournaments');
    const tournaments = await res.json();

    app.innerHTML = `
        <h2>Tournaments</h2>
        ${tournaments.map(t => `
            <div>
                ${t.players[0]} vs ${t.players[1]}
                <button onclick="vote(${t.id}, ${t.players[0]})">Vote P1</button>
                <button onclick="vote(${t.id}, ${t.players[1]})">Vote P2</button>
            </div>
        `).join('')}
    `;
}

async function vote(tournamentId, playerId) {
    await fetch('/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, playerId })
    });

    alert('Vote submitted!');
}

async function showStore() {
    const res = await fetch('/store');
    const cards = await res.json();

    app.innerHTML = `
        <h2>Store</h2>
        ${cards.map(c => `
            <div>
                <img src="${c.image}" width="100">
                <p>${c.name} - ${c.price} coins</p>
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
    }
}

async function showDeck() {
    const res = await fetch(`/deck/${currentUser.id}`);
    const cards = await res.json();

    app.innerHTML = `
        <h2>Your Deck</h2>
        ${cards.map(c => `
            <div>
                <img src="${c.image}" width="100">
                <p>${c.name}</p>
            </div>
        `).join('')}
        <button onclick="showDashboard(currentUser)">Back</button>
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