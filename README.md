# 🎴 Card Voting Game (Node.js Version)

## 🚀 Overview

This is a web-based card collection and tournament game where players can:

* Register and log into the system
* Earn and spend coins
* Buy avatar cards in the store
* Build their personal deck
* Join tournaments against other players
* Vote in tournaments
* Win based on community votes
* Climb a global ranking leaderboard

---

## 🧠 Core Concept

Players collect cards (avatars) and use them to compete in tournaments.
Each tournament is voted on by other users, and the player with the most votes wins.

---

## ⚙️ Tech Stack

* **Backend:** Node.js + Express
* **Frontend:** Vanilla JavaScript (SPA)
* **Storage:** JSON files (no database)

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
│   ├── players.json
│   ├── cards.json
│   ├── tournaments.json
│   └── votes.json
│
├── /routes
│   ├── auth.js
│   ├── players.js
│   ├── cards.js
│   ├── tournaments.js
│   ├── votes.js
│   ├── store.js
│   ├── deck.js
│   └── ranking.js
│
├── /services
│   ├── storage.js
│   ├── authService.js
│   ├── playerService.js
│   └── tournamentService.js
│
├── /public
│   ├── index.html
│   ├── app.js
│   ├── css/
│   └── images/
```

---

## 🔐 Authentication System

Users can:

* Register (`/auth/register`)
* Login (`/auth/login`)

⚠️ Note: Passwords are currently stored in plain text (for simplicity).
👉 Recommended improvement: use `bcrypt` for hashing.

---

## 💾 Data Storage (No SQL)

All data is stored in JSON files:

### players.json

```json
{
  "id": 1,
  "username": "Marco",
  "password": "123",
  "coins": 100,
  "cards": []
}
```

### cards.json

```json
{
  "id": 1,
  "name": "Dragon",
  "price": 50,
  "image": "images/dragon.png"
}
```

### tournaments.json

```json
{
  "id": 123,
  "players": [1, 2],
  "winner": null
}
```

### votes.json

```json
{
  "tournamentId": 123,
  "playerId": 1
}
```

---

## 🛒 Store System

* Players can buy cards using coins
* Each card has a price
* Coins are deducted on purchase
* Cards are added to the player's collection

Endpoint:

* `GET /store` → list cards
* `POST /store/buy` → buy card

---

## 🎴 Deck System

* Each player has a personal collection of cards
* Cards purchased appear in the deck

Endpoint:

* `GET /deck/:playerId`

---

## 🏆 Tournament System

* Players compete in tournaments
* Each tournament has 2 players
* Users vote on who wins

Endpoint:

* `POST /tournaments`

---

## 🗳️ Voting System

* Users vote on a tournament
* Votes are stored in `votes.json`
* Votes are counted automatically
* The winner is determined dynamically

Endpoint:

* `POST /votes`

---

## 🥇 Ranking System

* Based on tournament wins
* Each win increases the player score

Endpoint:

* `GET /ranking`

---

## 🖥️ Frontend (SPA)

The frontend is a simple Single Page Application built with vanilla JavaScript.

Features:

* Login / Register UI
* Dashboard
* Store (buy cards)
* Deck (view owned cards)
* Tournaments (vote system)
* Ranking leaderboard

---

## ▶️ How to Run

### 1. Install dependencies

```
npm install
```

### 2. Start server

```
npm start
```

### 3. Open browser

```
http://localhost:3000
```

---

## 🗑️ Removed from Original Project

* PHP backend
* MySQL database
* SQL files
* Server-side rendering

---

## ⚠️ Limitations

* No real authentication security
* No concurrency protection (file writes)
* Not scalable for production
* No real-time updates

---

## 🔥 Future Improvements

### Frontend

* Responsive design
* Better UX

### Game Features

* Card rarity system
* Packs / loot boxes
* Deck selection for tournaments
* Match animations
* Real-time voting (WebSockets)

---

## 🎮 Final Notes

This project is ideal for:

* Learning full-stack development
* Prototyping game mechanics
* Understanding APIs and frontend integration

---

💡 Built as a learning project evolving from PHP + MySQL → Node.js + JSON storage.
