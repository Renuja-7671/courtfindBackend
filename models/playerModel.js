const db = require('../config/db');

const Player = {
    getBookingsByPlayerId: (playerId, callback) => {
        const query = `
            SELECT a.name, b.booking_date, b.start_time, b.end_time, b.status, a.image_url
            FROM bookings b
            JOIN arenas a ON b.arenaId = a.arenaId
            WHERE b.playerId = ?;
        `;
        db.query(query, [playerId], callback);
    },

    getArenaCourtDetails: (callback) => {
        const query = `
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
            JOIN users u ON a.owner_id = u.userId;
        `;
        db.query(query, callback);
    },
};

module.exports = Player;
