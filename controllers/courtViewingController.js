const Player = require('../models/playerModel');

// Get arena and court details
exports.getArenaCourtDetails = async (req, res) => {
    try {
        const results = await Player.getArenaCourtDetails();

        if (results.length === 0) {
            return res.status(404).json({ message: "No courts found" });
        }

        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching arena and court details:", error);
        res.status(500).json({ error: "Database query failed" });
    }
};