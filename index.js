const express = require("express");

const app = express();
app.use(express.json());

const PASSWORD = process.env.PASSWORD;

app.post("/api/check", (req, res) => {
    const { password } = req.body;

    if (!PASSWORD) {
        return res.status(500).json({ success: false, error: "Server misconfigured" });
    }

    if (password === PASSWORD) {
        return res.json({ success: true });
    } else {
        return res.json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
