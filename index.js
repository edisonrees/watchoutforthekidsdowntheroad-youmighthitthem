const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.SUPERUSER_PASSWORD || "admin123";

app.use(cors());
app.use(bodyParser.json());

let agentStatus = {}; 
let bannedUsers = new Set();
let u2sdUsers = new Set();
let globalMask = { mode: "BORDER", minX: -1000, maxX: 1000, minZ: -1000, maxZ: 1000, centerX: 0, centerZ: 0, radius: 100, shape: "SQUARE", nodes: [] };

app.post('/api/check', (req, res) => {
    if (req.body.password === ADMIN_PASSWORD) res.json({ success: true });
    else res.status(401).json({ success: false });
});

app.get('/api/active-users', (req, res) => {
    const active = Object.keys(agentStatus).filter(u => Date.now() - agentStatus[u].lastSeen < 30000).map(u => ({ name: u, ...agentStatus[u] }));
    res.json(active);
});

app.patch('/api/active-users', (req, res) => {
    const { name, x, z, tx, tz, enabled } = req.body;
    if (name) agentStatus[name] = { x, z, tx, tz, enabled, lastSeen: Date.now() };
    res.json({ success: true });
});

app.get('/api/banned-users', (req, res) => res.json(Array.from(bannedUsers)));
app.post('/api/banned-users', (req, res) => { if (req.body.user) bannedUsers.add(req.body.user); res.json({ success: true }); });
app.delete('/api/banned-users', (req, res) => { if (req.body.user) bannedUsers.delete(req.body.user); res.json({ success: true }); });

app.get('/api/u2sd', (req, res) => res.json(Array.from(u2sdUsers)));
app.post('/api/u2sd', (req, res) => { if (req.body.user) u2sdUsers.add(req.body.user); res.json({ success: true }); });
app.delete('/api/u2sd', (req, res) => { if (req.body.user) u2sdUsers.delete(req.body.user); res.json({ success: true }); });

app.get('/api/global-mask', (req, res) => res.json(globalMask));
app.post('/api/global-mask', (req, res) => { globalMask = { ...globalMask, ...req.body }; res.json({ success: true }); });

app.listen(PORT, () => console.log(`Server on ${PORT}`));
