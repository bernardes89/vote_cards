const topbar = document.getElementById('topbar');
const content = document.getElementById('content');
let selectedTournamentType = 'beauty';
let selectedTournamentCardId = null;

function renderTopbar() {
    if (!window.currentUser) {
        topbar.innerHTML = '';
        return;
    }

    const avatarHtml = window.currentUser.avatar
        ? `<img class="avatar" src="${window.currentUser.avatar}" alt="avatar" onerror="this.style.display='none'">`
        : `<div class="avatar-placeholder">${(window.currentUser.username || 'P')[0]}</div>`;

    topbar.innerHTML = `
        <div class="topbar-left">
            ${avatarHtml}
            <div class="topbar-user">
                <strong>${window.currentUser.username}</strong>
                <span>Credits: ${window.currentUser.credits || 0}</span>
            </div>
        </div>
        <div class="topbar-nav">
            <button onclick="showDashboard()">Home</button>
            <button onclick="showTournamentEntry()">Enter Tournament</button>
            <button onclick="viewRunningTournaments()">Running</button>
            <button onclick="viewFinishedTournaments()">Finished</button>
            <button onclick="showStore()">Store</button>
            <button onclick="showDeck()">Deck</button>
            <button onclick="showRanking()">Ranking</button>
            <button onclick="showSettings()">Settings</button>
            <button onclick="logout()">Logout</button>
        </div>
    `;
}

function renderContent(html) {
    content.innerHTML = html;
}

function showLogin() {
    window.currentUser = null;
    renderTopbar();
    renderContent(`
        <h2>Login</h2>
        <div>
            <input id="user" placeholder="Username" autofocus>
            <input id="pass" type="password" placeholder="Password">
            <button onclick="login()">Login</button>
            <button onclick="showRegister()">Register</button>
        </div>
    `);
}

function showRegister() {
    renderTopbar();
    renderContent(`
        <h2>Register</h2>
        <div>
            <input id="user" placeholder="Username" autofocus>
            <input id="pass" type="password" placeholder="Password">
            <input id="avatar" placeholder="Avatar image URL (optional)">
            <button onclick="register()">Create Account</button>
            <button onclick="showLogin()">Back</button>
        </div>
    `);
}

async function register() {
    const username = document.getElementById('user').value.trim();
    const password = document.getElementById('pass').value.trim();
    const avatar = document.getElementById('avatar').value.trim();

    if (!username || !password) {
        return alert('Username and password are required');
    }

    const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, avatar })
    });
    const data = await res.json();

    if (data.error) {
        return alert(data.error);
    }

    alert('User created! Please log in.');
    showLogin();
}

async function login() {
    const username = document.getElementById('user').value.trim();
    const password = document.getElementById('pass').value.trim();

    if (!username || !password) {
        return alert('Please enter both username and password');
    }

    const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.error) {
        return alert(data.error);
    }

    window.currentUser = data;
    renderTopbar();
    showDashboard();
}

async function showDashboard() {
    renderTopbar();

    const cardCount = (window.currentUser.cards || []).length;
    renderContent(`
        <h2>Welcome ${window.currentUser.username}</h2>
        <p class="small-note">Use the top menu to navigate. Your credits and avatar remain visible at all times.</p>
        <div class="grid">
            <div class="player-row">
                <div><strong>Credits</strong></div>
                <div>${window.currentUser.credits || 0}</div>
                <div><strong>Cards</strong></div>
                <div>${cardCount}</div>
            </div>
            <div class="player-row">
                <div><strong>Tournament Wins</strong></div>
                <div>${window.currentUser.wins || 0}</div>
                <div><strong>Tournament Losses</strong></div>
                <div>${window.currentUser.losses || 0}</div>
            </div>
        </div>
    `);
}

async function showSettings() {
    renderTopbar();
    renderContent(`
        <h2>Player Settings</h2>
        <div>
            <label>Username</label>
            <input id="settings-username" value="${window.currentUser.username}">
            <label>New password</label>
            <input id="settings-password" type="password" placeholder="Leave empty to keep current password">
            <label>Avatar URL</label>
            <input id="settings-avatar" value="${window.currentUser.avatar || ''}" placeholder="https://...">
            <button onclick="saveSettings()">Save Settings</button>
        </div>
    `);
}

async function saveSettings() {
    const username = document.getElementById('settings-username').value.trim();
    const password = document.getElementById('settings-password').value.trim();
    const avatar = document.getElementById('settings-avatar').value.trim();

    const updates = { username, avatar };
    if (password) updates.password = password;

    const res = await fetch(`/players/${window.currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    const data = await res.json();

    if (data.error) {
        return alert(data.error);
    }

    window.currentUser = data;
    renderTopbar();
    alert('Settings updated');
    showDashboard();
}

async function showTournamentEntry() {
    renderTopbar();
    const res = await fetch(`/deck/${window.currentUser.id}`);
    const cards = await res.json();

    if (!cards.length) {
        renderContent(`
            <h2>Enter Tournament</h2>
            <p>You have no cards in your deck. Buy a card in the store before joining tournaments.</p>
        `);
        return;
    }

    if (!selectedTournamentCardId) {
        selectedTournamentCardId = cards[0].id;
    }

    renderContent(`
        <h2>Enter Tournament</h2>
        <div class="grid">
            <div>
                <label>Tournament Type</label>
                <select id="tournament-type" onchange="updateTournamentType(this.value)">
                    <option value="beauty" ${selectedTournamentType === 'beauty' ? 'selected' : ''}>Beauty</option>
                    <option value="charm" ${selectedTournamentType === 'charm' ? 'selected' : ''}>Charm</option>
                    <option value="kind" ${selectedTournamentType === 'kind' ? 'selected' : ''}>Kind</option>
                </select>
            </div>
            <div class="small-note">Click a card below to select it for the tournament.</div>
        </div>
        <div class="tournament-cards">
            ${cards.map(card => `
                <div class="card-small ${selectedTournamentCardId === card.id ? 'selected-card' : ''}" onclick="selectTournamentCard(${card.id})">
                    <img src="${card.image}" alt="${card.name}">
                    <strong>${card.name}</strong>
                    <p>Beauty: ${card.beauty}</p>
                    <p>Charm: ${card.charm}</p>
                    <p>Kind: ${card.kind}</p>
                </div>
            `).join('')}
        </div>
        <button onclick="submitTournamentEntry()">Enter Tournament</button>
    `);
}

function updateTournamentType(type) {
    selectedTournamentType = type;
}

function selectTournamentCard(cardId) {
    selectedTournamentCardId = cardId;
    showTournamentEntry();
}

async function submitTournamentEntry() {
    if (!selectedTournamentCardId) {
        return alert('Please select a card first');
    }

    const res = await fetch('/tournaments/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            playerId: window.currentUser.id,
            cardId: selectedTournamentCardId,
            type: selectedTournamentType
        })
    });
    const data = await res.json();

    if (data.error) {
        return alert(data.error);
    }

    alert(data.status === 'active' ? 'Tournament started! You are matched.' : 'Tournament created and waiting for opponent.');
    showDashboard();
}

async function viewRunningTournaments() {
    renderTopbar();
    const res = await fetch(`/tournaments/running?excludePlayerId=${window.currentUser.id}`);
    const tournaments = await res.json();

    renderContent(`
        <h2>Running Tournaments</h2>
        <div class="grid">
            ${tournaments.length ? tournaments.map(t => `
                <div class="tournament-card">
                    <p><strong>Type:</strong> ${t.type}</p>
                    <p><strong>Tournament ID:</strong> ${t.id}</p>
                    <button onclick="viewTournament(${t.id})">View & Vote</button>
                </div>
            `).join('') : '<p>No running tournaments available at the moment.</p>'}
        </div>
    `);
}

async function viewFinishedTournaments() {
    renderTopbar();
    const res = await fetch('/tournaments/finished');
    const tournaments = await res.json();

    renderContent(`
        <h2>Finished Tournaments</h2>
        <div class="grid">
            ${tournaments.length ? tournaments.map(t => `
                <div class="tournament-card">
                    <p><strong>Type:</strong> ${t.type}</p>
                    <p><strong>Winner:</strong> ${t.winner || 'Tie'}</p>
                    <button onclick="viewFinishedTournament(${t.id})">View Details</button>
                </div>
            `).join('') : '<p>No finished tournaments yet.</p>'}
        </div>
    `);
}

async function viewTournament(tournamentId) {
    renderTopbar();
    const res = await fetch(`/tournaments/${tournamentId}`);
    const tournament = await res.json();

    if (tournament.error) {
        return alert(tournament.error);
    }

    const cardsRes = await fetch('/store');
    const allCards = await cardsRes.json();
    const card1 = allCards.find(c => c.id == tournament.card1) || { name: 'Unknown', image: '', beauty: 0, charm: 0, kind: 0 };
    const card2 = allCards.find(c => c.id == tournament.card2) || { name: 'Unknown', image: '', beauty: 0, charm: 0, kind: 0 };
    const canVote = tournament.status === 'active' && ![tournament.player1, tournament.player2].includes(window.currentUser.id);

    renderContent(`
        <h2>Tournament Details</h2>
        <p><strong>Type:</strong> ${tournament.type}</p>
        <p><strong>Status:</strong> ${tournament.status}</p>
        <div class="tournament-cards">
            <div class="card-small">
                <img src="${card1.image}" alt="${card1.name}">
                <strong>${card1.name}</strong>
                <p>Beauty: ${card1.beauty}</p>
                <p>Charm: ${card1.charm}</p>
                <p>Kind: ${card1.kind}</p>
                ${canVote ? `<button onclick="voteOnTournament(${tournament.id}, ${tournament.card1})">Vote for this card</button>` : ''}
            </div>
            <div class="card-small">
                <img src="${card2.image}" alt="${card2.name}">
                <strong>${card2.name}</strong>
                <p>Beauty: ${card2.beauty}</p>
                <p>Charm: ${card2.charm}</p>
                <p>Kind: ${card2.kind}</p>
                ${canVote ? `<button onclick="voteOnTournament(${tournament.id}, ${tournament.card2})">Vote for this card</button>` : ''}
            </div>
        </div>
        ${tournament.status === 'finished' ? `<p><strong>Winner:</strong> ${tournament.winner || 'Tie'}</p>` : ''}
        <button onclick="viewRunningTournaments()">Back</button>
    `);
}

async function viewFinishedTournament(tournamentId) {
    renderTopbar();
    const res = await fetch(`/tournaments/${tournamentId}`);
    const tournament = await res.json();

    const cardsRes = await fetch('/store');
    const allCards = await cardsRes.json();
    const card1 = allCards.find(c => c.id == tournament.card1) || { name: 'Unknown', image: '', beauty: 0, charm: 0, kind: 0 };
    const card2 = allCards.find(c => c.id == tournament.card2) || { name: 'Unknown', image: '', beauty: 0, charm: 0, kind: 0 };

    renderContent(`
        <h2>Finished Tournament</h2>
        <p><strong>Type:</strong> ${tournament.type}</p>
        <div class="tournament-cards">
            <div class="card-small">
                <img src="${card1.image}" alt="${card1.name}">
                <strong>${card1.name}</strong>
                <p>Beauty: ${card1.beauty}</p>
                <p>Charm: ${card1.charm}</p>
                <p>Kind: ${card1.kind}</p>
            </div>
            <div class="card-small">
                <img src="${card2.image}" alt="${card2.name}">
                <strong>${card2.name}</strong>
                <p>Beauty: ${card2.beauty}</p>
                <p>Charm: ${card2.charm}</p>
                <p>Kind: ${card2.kind}</p>
            </div>
        </div>
        <p><strong>Winner:</strong> ${tournament.winner || 'Tie'}</p>
        <button onclick="viewFinishedTournaments()">Back</button>
    `);
}

async function voteOnTournament(tournamentId, votedCardId) {
    const res = await fetch('/tournaments/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, voterId: window.currentUser.id, votedCardId })
    });
    const result = await res.json();
    if (result.error) {
        return alert(result.error);
    }
    alert('Vote submitted!');
    viewRunningTournaments();
}

async function showStore() {
    renderTopbar();
    const res = await fetch('/store');
    const cards = await res.json();
    const owned = window.currentUser.cards || [];

    renderContent(`
        <h2>Store</h2>
        <div class="card-grid">
            ${cards.map(c => `
                <div class="card-small">
                    <img src="${c.image}" alt="${c.name}">
                    <strong>${c.name}</strong>
                    <p>Beauty: ${c.beauty}</p>
                    <p>Charm: ${c.charm}</p>
                    <p>Kind: ${c.kind}</p>
                    <p><strong>${c.price} credits</strong></p>
                    ${owned.includes(c.id) ? '<button disabled>Owned</button>' : `<button onclick="buy(${c.id})">Buy</button>`}
                </div>
            `).join('')}
        </div>
    `);
}

async function buy(cardId) {
    const res = await fetch('/store/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: window.currentUser.id, cardId })
    });
    const data = await res.json();

    if (data.error) {
        return alert(data.error);
    }

    window.currentUser = data.player;
    renderTopbar();
    alert('Card bought!');
    showStore();
}

async function showDeck() {
    renderTopbar();
    const res = await fetch(`/deck/${window.currentUser.id}`);
    const cards = await res.json();

    renderContent(`
        <h2>Your Deck</h2>
        <div class="card-grid">
            ${cards.map(c => `
                <div class="card-small">
                    <img src="${c.image}" alt="${c.name}">
                    <strong>${c.name}</strong>
                    <p>Beauty: ${c.beauty}</p>
                    <p>Charm: ${c.charm}</p>
                    <p>Kind: ${c.kind}</p>
                </div>
            `).join('')}
        </div>
    `);
}

async function showRanking() {
    renderTopbar();
    const res = await fetch('/ranking');
    const ranking = await res.json();

    renderContent(`
        <h2>Ranking</h2>
        <div class="grid">
            ${ranking.map(player => `
                <div class="player-row">
                    <div><strong>${player.username}</strong></div>
                    <div>Wins: ${player.wins}</div>
                    <div>Losses: ${player.losses}</div>
                    <div>Credits: ${player.credits}</div>
                </div>
            `).join('')}
        </div>
    `);
}

function logout() {
    window.currentUser = null;
    renderTopbar();
    showLogin();
}

showLogin();