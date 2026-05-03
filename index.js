const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.SUPERUSER_PASSWORD || "admin123";

app.use(cors());
app.use(bodyParser.json());

// In-memory storage (Resets on restart - for production use a database like MongoDB or Redis)
let activeUsers = new Set();
let bannedUsers = new Set();
let u2sdUsers = new Set();
let targets = [];

// ── AUTH ENDPOINT ────────────────────────────────────────────────────────────

app.post('/api/check', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Invalid password" });
    }
});

// ── ACTIVE USERS ─────────────────────────────────────────────────────────────

app.get('/api/active-users', (req, res) => {
    res.json(Array.from(activeUsers));
});

app.patch('/api/active-users', (req, res) => {
    const { add, remove } = req.body;
    if (add) activeUsers.add(add);
    if (remove) activeUsers.delete(remove);
    res.json({ success: true, count: activeUsers.size });
});

// ── BANNED USERS ─────────────────────────────────────────────────────────────

app.get('/api/banned-users', (req, res) => {
    res.json(Array.from(bannedUsers));
});

app.post('/api/banned-users', (req, res) => {
    const { user } = req.body;
    if (user) bannedUsers.add(user);
    res.json({ success: true });
});

app.delete('/api/banned-users', (req, res) => {
    const { user } = req.body;
    if (user) bannedUsers.delete(user);
    res.json({ success: true });
});

// ── U2SD LIST (Termination) ──────────────────────────────────────────────────

app.get('/api/u2sd', (req, res) => {
    res.json(Array.from(u2sdUsers));
});

app.post('/api/u2sd', (req, res) => {
    const { user } = req.body;
    if (user) u2sdUsers.add(user);
    res.json({ success: true });
});

app.delete('/api/u2sd', (req, res) => {
    const { user } = req.body;
    if (user) u2sdUsers.delete(user);
    res.json({ success: true });
});

// ── TARGETS ──────────────────────────────────────────────────────────────────

app.get('/api/user-target', (req, res) => {
    res.json(targets);
});

app.post('/api/user-target', (req, res) => {
    const { target } = req.body;
    if (target) targets.push(target);
    res.json({ success: true });
});

app.patch('/api/user-target', (req, res) => {
    const { clear, set } = req.body;
    if (clear) targets = [];
    if (set) targets = set;
    res.json({ success: true });
});

// ── START SERVER ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`ChunkLoader Auth Server running on port ${PORT}`);
    console.log(`Admin Password is set via environment variable.`);
});
