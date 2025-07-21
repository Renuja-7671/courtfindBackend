const db = require('../config/db'); // MySQL connection

// Get arena and court details
exports.getArenaCourtDetails = (req, res) => {
    const sql = `
        SELECT 
            a.name AS arena_name,
            c.name AS court_name,
            c.availability AS court_availability,
            c.images AS court_images,
            u.address AS arena_address,
            a.country AS arena_country,
            c.availability AS court_opening_hours
        FROM courts c
        JOIN arenas a ON c.arenaId = a.arenaId
        JOIN users u ON a.owner_id = u.userId
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching arena and court details:", err);
            return res.status(500).json({ error: "Database query failed" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No courts found" });
        }

        res.status(200).json(results);
    });
};
