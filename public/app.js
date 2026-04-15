const topbar = document.getElementById('topbar');
const content = document.getElementById('content');
let selectedTournamentType = 'beauty';
let selectedTournamentCardId = null;
let selectedFarmingDuration = 1;
let selectedFarmingCardId = null;
let selectedRagingBattleCardId = null;
let countdownIntervals = {};

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
            <button onclick="showTournamentEntry()">Tournaments</button>
            <button onclick="viewRunningTournaments()">Running</button>
            <button onclick="viewMyTournaments()">My Tournaments</button>
            <button onclick="viewFinishedTournaments()">Finished</button>
            <button onclick="showFarming()">Farming</button>
            <button onclick="showRagingBattles()">Raging Battles</button>
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
            <div class="player-row">
                <div><strong>Raging Wins</strong></div>
                <div>${window.currentUser.ragingWins || 0}</div>
                <div><strong>Raging Losses</strong></div>
                <div>${window.currentUser.ragingLosses || 0}</div>
            </div>
        </div>
    `);
}

async function showSettings() {
    renderTopbar();
    renderContent(`
        <h2>Player Settings</h2>
        <div>
            <div>
                <label>Username</label>
                <input id="settings-username" value="${window.currentUser.username}">
            </div>
            <div>
                <label>New password</label>
                <input id="settings-password" type="password" placeholder="Leave empty to keep current password">
            </div>
            <div>
                <label>Avatar URL</label>
                <input id="settings-avatar" value="${window.currentUser.avatar || ''}" placeholder="https://...">
            </div>
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
    const allCards = await res.json();

    const farmingRes = await fetch(`/farming/player/${window.currentUser.id}`);
    const farming = await farmingRes.json();
    const farmingCardIds = farming.map(f => f.cardId);

    const tournamentRes = await fetch(`/tournaments/my-tournaments/${window.currentUser.id}`);
    const myTournaments = await tournamentRes.json();
    const tournamentCardIds = myTournaments.map(t => [t.card1, t.card2]).flat();

    const ragingRes = await fetch('/raging-battles/active');
    const ragingBattles = await ragingRes.json();
    const ragingCardIds = ragingBattles.map(r => [r.card1, r.card2]).flat().filter(id => id);

    const unavailableCardIds = new Set([...farmingCardIds, ...tournamentCardIds, ...ragingCardIds]);
    const availableCards = allCards.filter(c => !unavailableCardIds.has(c.id));

    if (!availableCards.length) {
        renderContent(`
            <h2>Enter Tournament</h2>
            <p>You have no available cards. Some cards are farming, in tournaments, or in raging battles.</p>
        `);
        return;
    }

    if (!selectedTournamentCardId || unavailableCardIds.has(selectedTournamentCardId)) {
        selectedTournamentCardId = availableCards[0].id;
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
            ${availableCards.map(card => `
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

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
}

function startCountdown(tournamentId, endTime) {
    if (countdownIntervals[tournamentId]) clearInterval(countdownIntervals[tournamentId]);

    countdownIntervals[tournamentId] = setInterval(() => {
        const remainTime = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        const timerEl = document.getElementById(`timer-${tournamentId}`);
        if (timerEl) {
            timerEl.textContent = formatTime(remainTime);
        }
        if (remainTime === 0) {
            clearInterval(countdownIntervals[tournamentId]);
        }
    }, 1000);
}

async function viewRunningTournaments() {
    renderTopbar();
    const res = await fetch(`/tournaments/running?excludePlayerId=${window.currentUser.id}`);
    const tournaments = await res.json();

    let html = `<h2>Running Tournaments</h2>`;
    
    if (tournaments.length) {
        html += `<div class="grid">`;
        tournaments.forEach(t => {
            const remainTime = Math.max(0, Math.floor((t.endTime - Date.now()) / 1000));
            html += `
                <div class="tournament-card" id="tournament-${t.id}">
                    <p><strong>Type:</strong> ${t.type}</p>
                    <p><strong>Time Remaining:</strong> <span id="timer-${t.id}">${formatTime(remainTime)}</span></p>
                    <button onclick="viewTournament(${t.id})">View & Vote</button>
                </div>
            `;
        });
        html += `</div>`;
    } else {
        html += `<p>No running tournaments available at the moment.</p>`;
    }

    renderContent(html);

    tournaments.forEach(t => {
        startCountdown(t.id, t.endTime);
    });
}

async function viewMyTournaments() {
    renderTopbar();
    const res = await fetch(`/tournaments/my-tournaments/${window.currentUser.id}`);
    const myTournaments = await res.json();
    const cardsRes = await fetch('/store');
    const allCards = await cardsRes.json();

    let html = `<h2>My Tournaments</h2>`;
    
    if (myTournaments.length) {
        html += `<div class="grid">`;
        myTournaments.forEach(t => {
            const remainTime = Math.max(0, Math.floor((t.endTime - Date.now()) / 1000));
            const card1 = allCards.find(c => c.id == t.card1);
            const card2 = allCards.find(c => c.id == t.card2);

            html += `
                <div class="tournament-card" id="my-tournament-${t.id}">
                    <p><strong>Type:</strong> ${t.type}</p>
                    <p><strong>Status:</strong> ${t.status}</p>
                    <p><strong>Time Remaining:</strong> <span id="timer-${t.id}">${formatTime(remainTime)}</span></p>
                    <p>VS: ${t.player1 === window.currentUser.id ? (card2 ? card2.name : 'Unknown') : (card1 ? card1.name : 'Unknown')}</p>
                    <button onclick="viewTournament(${t.id})">View Details</button>
                </div>
            `;
        });
        html += `</div>`;
    } else {
        html += `<p>You are not participating in any tournaments.</p>`;
    }

    renderContent(html);

    myTournaments.forEach(t => {
        startCountdown(t.id, t.endTime);
    });
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
    const alreadyVoted = tournament.votes && tournament.votes.some(v => v.voterId == window.currentUser.id);

    renderContent(`
        <h2>Tournament Details</h2>
        <p><strong>Type:</strong> ${tournament.type}</p>
        <p><strong>Status:</strong> ${tournament.status}</p>
        ${tournament.status === 'active' ? `<p><strong>Time Remaining:</strong> <span id="detail-timer">${formatTime(Math.max(0, Math.floor((tournament.endTime - Date.now()) / 1000)))}</span></p>` : ''}
        <div class="tournament-cards">
            <div class="card-small">
                <img src="${card1.image}" alt="${card1.name}">
                <strong>${card1.name}</strong>
                <p>Beauty: ${card1.beauty}</p>
                <p>Charm: ${card1.charm}</p>
                <p>Kind: ${card1.kind}</p>
                ${canVote && !alreadyVoted ? `<button onclick="voteOnTournament(${tournament.id}, ${tournament.card1})">Vote for this card</button>` : ''}
            </div>
            <div class="card-small">
                <img src="${card2.image}" alt="${card2.name}">
                <strong>${card2.name}</strong>
                <p>Beauty: ${card2.beauty}</p>
                <p>Charm: ${card2.charm}</p>
                <p>Kind: ${card2.kind}</p>
                ${canVote && !alreadyVoted ? `<button onclick="voteOnTournament(${tournament.id}, ${tournament.card2})">Vote for this card</button>` : ''}
            </div>
        </div>
        ${tournament.status === 'finished' ? `<p><strong>Winner:</strong> ${tournament.winner ? 'Player ' + tournament.winner : 'Tie'}</p>` : ''}
        ${alreadyVoted && canVote ? `<p style="color: orange;">You have already voted in this tournament.</p>` : ''}
        <button onclick="viewRunningTournaments()">Back</button>
    `);

    if (tournament.status === 'active') {
        startCountdown('detail', tournament.endTime);
    }
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
        <h2>Finished Tournament Details</h2>
        <p><strong>Type:</strong> ${tournament.type}</p>
        <div class="tournament-cards">
            <div class="card-small" style="border: ${tournament.winner === tournament.player1 ? '3px solid gold' : '2px solid #ccc'};">
                <img src="${card1.image}" alt="${card1.name}">
                <strong>${card1.name}</strong>
                <p>Beauty: ${card1.beauty}</p>
                <p>Charm: ${card1.charm}</p>
                <p>Kind: ${card1.kind}</p>
                <p>${tournament.winner === tournament.player1 ? '<strong style="color: gold;">WINNER</strong>' : tournament.winner === tournament.player2 ? '<strong style="color: red;">LOST</strong>' : '<strong>TIE</strong>'}</p>
            </div>
            <div class="card-small" style="border: ${tournament.winner === tournament.player2 ? '3px solid gold' : '2px solid #ccc'};">
                <img src="${card2.image}" alt="${card2.name}">
                <strong>${card2.name}</strong>
                <p>Beauty: ${card2.beauty}</p>
                <p>Charm: ${card2.charm}</p>
                <p>Kind: ${card2.kind}</p>
                <p>${tournament.winner === tournament.player2 ? '<strong style="color: gold;">WINNER</strong>' : tournament.winner === tournament.player1 ? '<strong style="color: red;">LOST</strong>' : '<strong>TIE</strong>'}</p>
            </div>
        </div>
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
                    <div>Tournament Wins: ${player.tournamentWins}</div>
                    <div>Tournament Losses: ${player.tournamentLosses}</div>
                    <div>Raging Wins: ${player.ragingWins}</div>
                    <div>Raging Losses: ${player.ragingLosses}</div>
                    <div><strong>Total Wins: ${player.totalWins}</strong></div>
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

async function showFarming() {
    renderTopbar();
    const res = await fetch(`/farming/player/${window.currentUser.id}`);
    const farmingCards = await res.json();

    const deckRes = await fetch(`/deck/${window.currentUser.id}`);
    const allCards = await deckRes.json();

    const farmingCardIds = farmingCards.map(f => f.cardId);
    const availableForFarming = allCards.filter(c => !farmingCardIds.includes(c.id));

    let html = `
        <h2>Farming</h2>
        <p>Select a card to farm credits. The card will be unavailable for battles and tournaments while farming.</p>
        
        <h3>Your Active Farms</h3>
    `;

    if (farmingCards.length > 0) {
        html += `<div class="grid">`;
        farmingCards.forEach(farm => {
            const card = allCards.find(c => c.id == farm.cardId) || { name: 'Unknown' };
            const remainingTime = Math.max(0, Math.floor((farm.endTime - Date.now()) / 1000));
            const durationHour = Math.floor((farm.endTime - farm.startTime) / (1000 * 3600));
            html += `
                <div class="farming-card">
                    <p><strong>${card.name}</strong></p>
                    <p>Duration: ${durationHour}h | Reward: ${farm.reward} credits</p>
                    <p>Time remaining: <span id="farm-timer-${farm.id}">${formatTime(remainingTime)}</span></p>
                    <button style="background: #4CAF50;" onclick="completeFarming(${farm.id})">Harvest Now</button>
                </div>
            `;
        });
        html += `</div>`;
    } else {
        html += `<p>No active farms.</p>`;
    }

    html += `
        <h3>Start a New Farm</h3>
    `;

    if (availableForFarming.length > 0) {
        html += `
            <div>
                <label>Select Duration:
                    <select id="farming-duration" onchange="selectedFarmingDuration = parseInt(this.value)">
                        <option value="1">1 hour (100 credits)</option>
                        <option value="2">2 hours (200 credits)</option>
                        <option value="4">4 hours (400 credits)</option>
                        <option value="8">8 hours (800 credits)</option>
                    </select>
                </label>
            </div>
            <h3>Available Cards</h3>
            <div class="card-grid">
                ${availableForFarming.map(c => `
                    <div class="card-small" onclick="selectFarmingCard(${c.id});" style="cursor: pointer; border: 2px solid #ddd;">
                        <img src="${c.image}" alt="${c.name}">
                        <strong>${c.name}</strong>
                        <p>Beauty: ${c.beauty}</p>
                        <p>Charm: ${c.charm}</p>
                        <p>Kind: ${c.kind}</p>
                        <button onclick="event.stopPropagation(); startFarming(${c.id})">Farm This</button>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        html += `<p>All your cards are currently farming, in tournaments, or in raging battles.</p>`;
    }

    renderContent(html);

    // Start countdown timers for active farms
    farmingCards.forEach(farm => {
        const timerElement = document.getElementById(`farm-timer-${farm.id}`);
        if (timerElement) {
            startFarmingCountdown(farm.id, farm.endTime);
        }
    });
}

function selectFarmingCard(cardId) {
    selectedFarmingCardId = cardId;
}

async function startFarming(cardId) {
    const res = await fetch('/farming/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            playerId: window.currentUser.id,
            cardId: cardId,
            duration: selectedFarmingDuration
        })
    });
    const data = await res.json();

    if (data.error) {
        return alert(data.error);
    }

    alert(`Farming started! Your card will farm for ${selectedFarmingDuration} hour(s).`);
    showFarming();
}

async function completeFarming(farmId) {
    const res = await fetch('/farming/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmId })
    });
    const data = await res.json();

    if (data.error) {
        return alert(data.error);
    }

    window.currentUser.credits = (window.currentUser.credits || 0) + data.reward;
    renderTopbar();
    alert(`Farming completed! You earned ${data.reward} credits.`);
    showFarming();
}

function startFarmingCountdown(farmId, endTime) {
    const timerElement = document.getElementById(`farm-timer-${farmId}`);
    if (!timerElement) return;

    const updateTimer = () => {
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        timerElement.textContent = formatTime(remaining);
        if (remaining > 0) {
            setTimeout(updateTimer, 1000);
        }
    };
    updateTimer();
}

async function showRagingBattles() {
    renderTopbar();
    
    const activeBattlesRes = await fetch('/raging-battles/active');
    const activeBattles = await activeBattlesRes.json();

    const finishedBattlesRes = await fetch('/raging-battles/finished');
    const finishedBattles = await finishedBattlesRes.json();

    const deckRes = await fetch(`/deck/${window.currentUser.id}`);
    const playerCards = await deckRes.json();

    let html = `<h2>Raging Battles</h2><p>Challenge other players to direct card battles. Winner gets +100 credits, loser gets -100.</p>`;

    html += `<h3>Active Battles (Waiting for Opponent)</h3>`;
    const myActiveBattles = activeBattles.filter(b => b.player1 === window.currentUser.id || b.player2 === window.currentUser.id);
    if (myActiveBattles.length > 0) {
        html += `<div class="grid">`;
        myActiveBattles.forEach(b => {
            html += `
                <div class="tournament-card">
                    <p><strong>Waiting...</strong></p>
                    <p>Time: <span id="battle-wait-${b.id}">${formatTime(Math.max(0, Math.floor((b.startTime + 5 * 60 * 1000 - Date.now()) / 1000)))}</span></p>
                </div>
            `;
        });
        html += `</div>`;
    } else {
        html += `<p>No active battles. Create a new one!</p>`;
    }

    html += `<h3>Finished Battles</h3>`;
    const myFinishedBattles = finishedBattles.filter(b => b.player1 === window.currentUser.id || b.player2 === window.currentUser.id).slice(0, 5);
    if (myFinishedBattles.length > 0) {
        html += `<div class="grid">`;
        myFinishedBattles.forEach(b => {
            const isWinner = b.winner === window.currentUser.id;
            html += `
                <div class="tournament-card" style="border: ${isWinner ? '3px solid gold' : '2px solid #ccc'};">
                    <p>${isWinner ? '<strong style="color: gold;">WINNER (+100 credits)</strong>' : '<strong style="color: red;">LOST (-100 credits)</strong>'}</p>
                </div>
            `;
        });
        html += `</div>`;
    } else {
        html += `<p>No finished battles yet.</p>`;
    }

    html += `<h3>Start a New Battle</h3>`;
    if (playerCards.length > 0) {
        html += `
            <div class="card-grid">
                ${playerCards.map(c => `
                    <div class="card-small" onclick="selectRagingBattleCard(${c.id});" style="cursor: pointer; border: 2px solid #ddd;">
                        <img src="${c.image}" alt="${c.name}">
                        <strong>${c.name}</strong>
                        <p>Beauty: ${c.beauty} | Charm: ${c.charm} | Kind: ${c.kind}</p>
                        <p>Total: ${c.beauty + c.charm + c.kind}</p>
                        <button onclick="event.stopPropagation(); enterRagingBattle(${c.id})">Challenge</button>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        html += `<p>You have no cards. Buy some cards in the store first.</p>`;
    }

    renderContent(html);

    // Start countdown timers for active battles wait
    myActiveBattles.forEach(b => {
        const timerElement = document.getElementById(`battle-wait-${b.id}`);
        if (timerElement) {
            const updateTimer = () => {
                const remaining = Math.max(0, Math.floor((b.startTime + 5 * 60 * 1000 - Date.now()) / 1000));
                timerElement.textContent = formatTime(remaining);
                if (remaining > 0) {
                    setTimeout(updateTimer, 1000);
                }
            };
            updateTimer();
        }
    });
}

function selectRagingBattleCard(cardId) {
    selectedRagingBattleCardId = cardId;
}

async function enterRagingBattle(cardId) {
    const res = await fetch('/raging-battles/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            playerId: window.currentUser.id,
            cardId: cardId
        })
    });
    const data = await res.json();

    if (data.error) {
        return alert(data.error);
    }

    alert('Battle created! Waiting for an opponent...');
    showRagingBattles();
}

showLogin();