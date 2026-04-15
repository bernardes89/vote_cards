# 🎴 Card Voting Game (Node.js Version)

## 🚀 Overview

This is a comprehensive web-based card collection and tournament game where players can:

* Register and log into the system with avatar support
* Start with 1000 credits
* Buy cards from the store (500 credits each)
* Build their personal deck with attributes (Beauty, Charm, Kind)
* Join three different game modes: **Tournaments**, **Farming**, and **Raging Battles**
* Climb a global ranking leaderboard based on total wins
* Auto-discover new card images placed in `/public/imgs/`

---

## 🧠 Core Concept

Players collect cards with unique attributes and use them to compete in multiple game modes:
1. **Tournaments**: Vote-based competitions with 3 types (Beauty, Charm, Kind)
2. **Farming**: Time-based credit earning system
3. **Raging Battles**: Direct card-vs-card battles with stat-based winner determination

---

## ⚙️ Tech Stack

* **Backend:** Node.js + Express
* **Frontend:** Vanilla JavaScript (SPA with responsive design)
* **Storage:** JSON files (no database)
* **Features:** Real-time countdown timers, persistent UI menu, auto-image scanning

---

## 📁 Project Structure

```
card-voting-game/
│
├── server.js
├── package.json
├── README.md
│
├── /data
│   ├── players.json          (user accounts with wins/losses/credits/cards)
│   ├── cards.json            (card catalog with attributes)
│   ├── tournaments.json       (active and finished tournaments)
│   ├── farming.json          (active farming records)
│   ├── ragingBattles.json    (active and finished battles)
│   └── votes.json            (tournament voting records)
│
├── /routes
│   ├── auth.js               (login/register)
│   ├── players.js            (player profile management)
│   ├── cards.js              (card operations)
│   ├── tournaments.js         (tournament management)
│   ├── farming.js            (farming operations)
│   ├── ragingBattles.js      (battle management)
│   ├── votes.js              (voting operations)
│   ├── store.js              (card purchases)
│   ├── deck.js               (player's card collection)
│   └── ranking.js            (leaderboard)
│
├── /services
│   ├── storage.js            (JSON file I/O)
│   ├── authService.js        (auth logic)
│   ├── playerService.js      (player management)
│   ├── tournamentService.js  (tournament logic)
│   ├── farmingService.js     (farming system)
│   ├── ragingBattlesService.js (battle logic)
│   └── cardScannerService.js (auto-image discovery)
│
├── /public
│   ├── index.html            (SPA shell with responsive layout)
│   ├── app.js                (all client-side logic and UI rendering)
│   ├── imgs/                 (card images - auto-scanned for new cards)
│   └── styles                (responsive CSS)
```

---

## 🔐 Authentication System

### User Registration
- Users create account with username, password, and optional avatar URL
- New players start with **1000 credits**
- Accounts include: `id`, `username`, `password`, `credits`, `cards[]`, `wins`, `losses`, `ragingWins`, `ragingLosses`, `avatar`
- Passwords stored in plain text (⚠️ improve with bcrypt for production)

### User Login
- Validates credentials against stored players
- Auto-normalizes old accounts to new schema (migration support)
- Returns user object with all stats

---

## 💳 Player Credits System

**Starting Amount:** 1000 credits per new player

**Credit Transactions:**
- **Buy Card:** -500 credits
- **Tournament Win:** +1000 credits
- **Farming (1h):** +100 credits
- **Farming (2h):** +200 credits
- **Farming (4h):** +400 credits
- **Farming (8h):** +800 credits
- **Raging Battle Win:** +100 credits
- **Raging Battle Loss:** -100 credits

**Minimum Balance:** Players can go negative (debt system enabled)

---

## 🎴 Card System

### Card Attributes
Each card has three attributes (1-10 scale):
- **Beauty:** Visual appeal rating
- **Charm:** Charisma rating
- **Kind:** Kindness rating

### Card Data Structure
```json
{
  "id": 1,
  "name": "Dragon",
  "price": 500,
  "image": "imgs/dragon.png",
  "beauty": 7,
  "charm": 8,
  "kind": 5
}
```

### Auto-Image Discovery
- **Mechanism:** Every 5 minutes, CardScannerService scans `/public/imgs/` for new image files
- **Supported Formats:** JPG, JPEG, PNG, GIF, WEBP
- **Auto-Generation:** New images get random attributes (1-10) and are added to `cards.json`
- **Card Name Generation:** Filename converted to title case (e.g., `fire_dragon.png` → "Fire Dragon")

---

## 🛒 Store System

**Functionality:**
- Display all available cards with their attributes
- Show ownership status (Owned/Buy button)
- Prevent purchasing duplicate cards (one card per player)
- Deduct 500 credits on purchase
- Add card to player's deck immediately
- Prevents purchase if player has insufficient credits

**Endpoints:**
- `GET /store` → List all cards
- `POST /store/buy` → Purchase a card

---

## 🎴 Deck System

**A player's personal card collection**
- Cards purchased from the store
- Used for tournaments, farming, and raging battles
- Each card can only be used in ONE mode at a time (no overlap)

**Endpoints:**
- `GET /deck/:playerId` → Get player's cards

---

## 🏆 Tournament System (Type-Based)

### Tournament Types
Players choose one of three tournament types based on card attributes:
1. **Beauty Tournaments** → Card with highest beauty wins
2. **Charm Tournaments** → Card with highest charm wins
3. **Kind Tournaments** → Card with highest kind wins

### Tournament Lifecycle

**Phase 1: Pending (5 minutes)**
- First player enters tournament with card + type
- Tournament waits for second player
- Auto-removes if no opponent joins within 5 minutes

**Phase 2: Active (4 minutes)**
- Second player joins with their card
- Tournament becomes active
- Other players can vote (except the two participants)
- Countdown timer displays remaining time

**Phase 3: Finished**
- Tournament ends automatically after 4 minutes
- Winner determined by highest vote count in tournament type
- Winner gets +1000 credits and +1 tournament win
- Loser gets +1 tournament loss
- If tie: No winner, both get loss (timeout → tie scenario)

### Vote Mechanism
- Only non-participants can vote
- Based on voting count (not attributes)
- One vote per player per tournament
- Community decides the winner

**Endpoints:**
- `POST /tournaments/enter` → Join or create tournament
- `GET /tournaments/running` → Get active tournaments
- `GET /tournaments/finished` → Get completed tournaments
- `GET /tournaments/my-tournaments/:playerId` → Get player's tournaments
- `POST /tournaments/vote` → Cast a vote
- `GET /tournaments/:id` → Get tournament details

---

## 🌾 Farming System (NEW)

### Concept
Players sacrifice a card for a fixed duration to earn credits automatically.

### Duration Options
- **1 hour** → 100 credits reward
- **2 hours** → 200 credits reward  
- **4 hours** → 400 credits reward
- **8 hours** → 800 credits reward

### Mechanics
- Card becomes unavailable for tournaments/raging battles during farming
- Real-time countdown timer shows remaining time
- Auto-complete: Credits awarded when timer expires
- Manual harvest: Complete farming early and claim credits (no penalty)
- Multiple cards can farm simultaneously (one farm per card)

### Card Blocking
- A card in farming **cannot** enter tournaments or raging battles
- A card in tournament **cannot** enter farming or raging battles
- A card in raging battle **cannot** enter farming or tournaments

**Endpoints:**
- `POST /farming/start` → Start farming with a card
- `GET /farming/player/:playerId` → Get player's active farms
- `POST /farming/complete` → Manually harvest and claim rewards

**Data Structure:**
```json
{
  "id": 1640000000000,
  "playerId": 1,
  "cardId": 5,
  "duration": 2,
  "reward": 200,
  "startTime": 1640000000000,
  "endTime": 1640007200000,
  "status": "active"
}
```

---

## ⚔️ Raging Battles System (NEW)

### Concept
Direct one-on-one card battles where the card with the highest combined attribute score wins.

### Battle Mechanics
- **Matching:** Auto-pairs waiting players (first come, first served)
- **Waiting Time:** 5 minutes to find opponent (auto-cancel if unmatched)
- **Winner Determination:** Card with highest (beauty + charm + kind) total wins
- **Credits Transfer:** Winner +100, Loser -100 (can go negative)
- **Win/Loss Tracking:** Stored separately from tournament wins/losses

### Battle States
1. **Waiting:** Solo player waits for opponent (5 min timeout)
2. **Active:** Two players matched, battle resolves immediately
3. **Finished:** Results recorded, credits awarded, win/loss tracker updated

**Endpoints:**
- `POST /raging-battles/enter` → Enter the battle queue with a card
- `GET /raging-battles/active` → Get waiting/active battles
- `GET /raging-battles/finished` → Get completed battles

**Data Structure:**
```json
{
  "id": 1640000000000,
  "player1": 1,
  "card1": 5,
  "player2": 2,
  "card2": 8,
  "startTime": 1640000000000,
  "endTime": 1640000060000,
  "status": "finished",
  "winner": 1
}
```

---

## 👥 Player Schema

### Complete Player Object
```json
{
  "id": 1640000000000,
  "username": "Marco",
  "password": "123456",
  "credits": 1500,
  "cards": [1, 2, 5, 8],
  "wins": 3,
  "losses": 1,
  "ragingWins": 2,
  "ragingLosses": 0,
  "avatar": "https://example.com/avatar.jpg"
}
```

### Player Fields
- `id` - Unique player identifier
- `username` - Display name (unique)
- `password` - Login credential (plain text)
- `credits` - Current balance
- `cards[]` - Array of owned card IDs
- `wins` - Tournament victories
- `losses` - Tournament defeats
- `ragingWins` - Raging battle victories
- `ragingLosses` - Raging battle defeats
- `avatar` - Profile image URL

---

## 🥇 Ranking System

### Ranking Calculation
Players ranked by:
1. **Primary Sort:** Total wins (tournaments + raging) - DESCENDING
2. **Secondary Sort:** Total losses - ASCENDING
3. **Tiebreaker:** Earlier registered players ranked higher

### Ranking Display
```json
{
  "id": 1,
  "username": "Marco",
  "avatar": "https://...",
  "tournamentWins": 3,
  "tournamentLosses": 1,
  "ragingWins": 2,
  "ragingLosses": 0,
  "totalWins": 5,
  "totalLosses": 1
}
```

**Endpoint:**
- `GET /ranking` → Get complete leaderboard

---

## 🖥️ Frontend (SPA)

### Architecture
- **Single Page Application:** Vanilla JavaScript, no framework
- **Persistent Top Menu:** Always visible with avatar, username, credits
- **Responsive Design:** Mobile-first CSS with media queries
- **Real-Time Timers:** JavaScript countdown for tournaments, farming, battles

### Pages/Views

1. **Login/Register**
   - Username and password
   - Optional avatar URL input
   - Account creation with 1000 starting credits

2. **Dashboard (Home)**
   - Welcome message
   - Player stats: credits, card count, wins, losses, raging stats

3. **Tournament Entry**
   - Type selector: Beauty / Charm / Kind
   - Card grid showing available cards (excludes farming/raging/tournament cards)
   - Submit button to enter tournament

4. **Running Tournaments**
   - List of active tournaments
   - Countdown timer for each
   - "View & Vote" button to participate

5. **My Tournaments**
   - Player's active and finished tournaments
   - Opponent card and type displayed
   - Status and time remaining

6. **Finished Tournaments**
   - Historical tournament results
   - Winner highlighted with gold border
   - Loser shown with red border

7. **Farming Mode**
   - Active farms with countdown timers
   - "Harvest Now" button for manual completion
   - New farm creation with duration selector
   - Available cards grid (excludes farming/raging/tournament cards)

8. **Raging Battles**
   - Active battles waiting for opponent
   - Finished battles with win/loss display
   - Challenge form with card selection
   - Shows card attribute totals

9. **Store**
   - All cards with attributes
   - Price: 500 credits
   - "Owned" button for purchased cards
   - "Buy" button for available cards
   - Prevents duplicate purchases

10. **Deck**
    - Player's card collection in responsive grid
    - Shows all three attributes per card

11. **Ranking**
    - Leaderboard with player stats
    - Sorted by total wins (desc) then losses (asc)
    - Shows tournament and raging battle records separately

12. **Settings**
    - Update username
    - Change password (optional)
    - Update avatar URL
    - Save button

### UI Features
- **Top Bar:** Avatar, username, credits (always visible)
- **Navigation:** Buttons for all main pages
- **Countdown Timers:** Real-time updates via setInterval
- **Card Blocking Indicators:** Grayed-out unavailable cards
- **Responsive Grid:** 4-column desktop, 2-column tablet, 1-column mobile
- **Error Handling:** Alert messages for invalid actions

---

## 🔧 Server Configuration

### Port
- Default: `3000`
- Run: `npm start`

### Automatic Processes

**Tournament Timeout Check**
- Runs every 60 seconds
- Removes pending tournaments after 5 minutes
- Finishes active tournaments after 4 minutes
- Awards credits and updates win/loss records

**Farming Timeout Check**
- Runs every 60 seconds
- Auto-completes finished farms
- Awards credits to players

**Raging Battle Timeouts**
- Runs every 60 seconds
- Removes unmatched battles after 5 minutes
- Finishes matched battles and awards credits

**Card Image Scanner**
- Runs on server startup
- Scans `/public/imgs/` every 5 minutes
- Auto-adds new images to `cards.json` with random attributes
- Logs discoveries to console

---

## 🔄 Game Mode Interaction Rules

### Card State Machine
A card can only be in ONE of these states:
1. **Available** - Ready to use in any mode
2. **In Tournament** - Locked until tournament ends
3. **Farming** - Locked until farming completes
4. **In Raging Battle** - Locked until battle completes

### Validation Rules
- Cannot buy card twice
- Cannot farm while in tournament
- Cannot enter tournament while farming
- Cannot enter raging battle while farming or in tournament
- Prevents card conflicts across all three game modes

---

## 💾 Data Files

### players.json
- Array of all player objects
- Updated on: login, register, settings change, tournament end, farming end, battle end

### cards.json
- Array of all cards
- Updated on: card purchase (not modified, just referenced)
- Auto-updated by CardScannerService with new images

### tournaments.json
- Array of all tournament objects (pending, active, finished)
- Updated on: tournament entry, voting, timeout
- Keeps historical record of all tournaments

### farming.json
- Array of all farming records
- Updated on: farming start, farming completion, timeout
- Keeps historical record (status: active/finished)

### ragingBattles.json
- Array of all battle records
- Updated on: battle entry, matching, completion, timeout
- Keeps historical record (status: waiting/finished)

### votes.json
- Array of all tournament votes
- Updated on: vote cast
- Used to determine tournament winners

---

## 🚀 How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
npm start
```

Server will output: `Server running on http://localhost:3000`

### 3. Open in Browser
```
http://localhost:3000
```

### 4. Add Custom Cards (Optional)
Place image files in `/public/imgs/`:
- Supported formats: JPG, JPEG, PNG, GIF, WEBP
- Each image auto-discovered within 5 minutes
- Gets random attributes (1-10)
- Card name auto-generated from filename

---

## 🔥 Recent Features Added

### Farming System
- Time-based credit earning (1h/2h/4h/8h durations)
- Real-time countdown timers
- Manual harvest option
- Card blocking during active farm

### Raging Battles System
- Direct card-vs-card combat
- Stat-based winner determination (total attributes)
- 5-minute matchmaking window
- Separate win/loss tracking
- Credit transfer (+100/-100)

### Auto-Image Scanning
- Continuously scans `/public/imgs/` for new files
- Runs every 5 minutes
- Auto-generates card entries with random attributes
- Console logging for discoveries

### Enhanced Tournament System
- Type-based matching (beauty/charm/kind)
- 5-minute pending phase, 4-minute active phase
- Vote-based winner determination
- Timeout handling with proper state transitions

### Card Attributes
- Three attributes per card: Beauty, Charm, Kind
- 1-10 scale for each
- Used in tournament matching and raging battle winner calculation
- Visible in all UI displays

### Persistent Top Menu
- Always visible avatar, username, credits
- Quick navigation buttons
- Updates immediately on credit changes
- Responsive design for mobile/desktop

### Responsive Design
- Mobile-first CSS with media queries
- Grid layouts for cards
- Touch-friendly button sizes
- Readable countdown timers

---

## ⚠️ Limitations

* No real authentication security
* Passwords stored in plain text
* No concurrency protection (file writes)
* Not scalable for production (local JSON storage)
* No real-time updates via WebSockets
* Single-threaded Node.js (no worker threads)
* No backup/disaster recovery

---

## 🔒 Security Notes

⚠️ **For Production:**
- Use `bcrypt` for password hashing
- Implement session tokens / JWT
- Add database (PostgreSQL, MongoDB)
- Use HTTPS
- Rate limiting on API endpoints
- Input validation on all endpoints
- CORS configuration
- SQL injection / XSS prevention

---

## 🎮 Game Balance

### Credit Economy
- Entry barrier: 500 credits to buy first card, need 5 cards to participate in tournaments
- Farming: Long commitment (8h) for 800 credits
- Raging battles: Quick, high-risk (+100/-100 per battle)
- Tournament wins: 1000 credits for major investment (waiting + voting phase)

### Win Conditions
- **Farming:** Pure time investment, guaranteed reward
- **Tournaments:** Skill-based (card selection) + luck-based (voting)
- **Raging Battles:** Card attributes matter (predetermined outcome)

### Progression
Early game → Buy cards → Enter tournaments → Farm credits → Buy more cards → Climb ranking

---

## 📝 Future Enhancement Ideas

### Gameplay
- Seasonal tournaments with leaderboard resets
- Rare/Epic/Legendary card tiers
- Card evolution system
- Team tournaments (2v2)
- Daily quests for bonus credits
- Card trading between players
- Championship titles/badges

### Technical
- Real-time updates with WebSockets
- Database migration (PostgreSQL)
- Player authentication with JWT
- Multiplayer lobby system
- Spectator mode for tournaments
- Replay system for battles
- Performance optimization (indexing, caching)

### UI/UX
- Card animations and effects
- Battle visualization
- Sound effects
- Mobile app version
- Accessibility improvements (ARIA labels)
- Dark mode theme
- Internationalization (i18n)

---

## 🤝 Contributing

This is a learning project. Improvements welcome!

Areas for contribution:
- Testing framework setup
- Database migration
- Authentication security
- UI/UX enhancements
- Game balance adjustments
- Performance optimization

---

## 📄 License

Open source learning project

---

💡 **Built as an evolving full-stack learning project:** PHP + MySQL → Node.js + JSON Storage → Enhanced multiplayer game system

**Last Updated:** 2024

