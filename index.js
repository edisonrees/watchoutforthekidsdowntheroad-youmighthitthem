const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-Memory Data Stores
let activeUsers = new Set();
let bannedUsers = ["example_cheater"]; // Pre-populate for testing
let u2sdList = ["untrusted_user1"];    // Users marked for self-destruct
let currentTargets = ["target_player_01"];
let userInstructions = "Wait for command";

// Secret password for the mod handshake
const MOD_PASSWORD = process.env.MOD_PASSWORD || "chunky-security-2024";

// --- 1. Authentication Handshake ---
app.post('/api/check', (req, res) => {
    const { password } = req.body;
    if (password === MOD_PASSWORD) {
        return res.status(200).json({ success: true });
    }
    res.status(401).json({ success: false, message: "Invalid credentials" });
});

// --- 2. Presence & Active Users ---
app.get('/api/active-users', (req, res) => res.json(Array.from(activeUsers)));

app.patch('/api/active-users', (req, res) => {
    const { add, remove } = req.body;
    if (add) activeUsers.add(add);
    if (remove) activeUsers.delete(remove);
    res.json({ success: true, count: activeUsers.size });
});

// --- 3. Targeting ---
app.get('/api/user-target', (req, res) => {
    res.json({ targets: currentTargets });
});

app.post('/api/user-target', (req, res) => {
    const { target } = req.body;
    if (target) currentTargets.push(target);
    res.json(currentTargets);
});

// --- 4. Security Lists (Banned & U2SD) ---
// Generic handler for list management
const manageList = (list) => ({
    get: (req, res) => res.json(list),
    post: (req, res) => {
        const { user } = req.body;
        if (user && !list.includes(user)) list.push(user);
        res.json(list);
    },
    delete: (req, res) => {
        const { user } = req.body;
        const index = list.indexOf(user);
        if (index > -1) list.splice(index, 1);
        res.json(list);
    }
});

app.route('/api/banned-users')
    .get(manageList(bannedUsers).get)
    .post(manageList(bannedUsers).post)
    .delete(manageList(bannedUsers).delete);

app.route('/api/u2sd')
    .get(manageList(u2sdList).get)
    .post(manageList(u2sdList).post)
    .delete(manageList(u2sdList).delete);

// --- 5. Instructions ---
app.get('/api/user-instructions', (req, res) => res.json({ instruction: userInstructions }));
app.post('/api/user-instructions', (req, res) => {
    userInstructions = req.body.instruction || userInstructions;
    res.json({ success: true });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Railway Management Server running on port ${PORT}`);
});
