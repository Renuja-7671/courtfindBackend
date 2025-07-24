const db = require('../config/db');

const NotificationModel = {
    getUpcomingSessions: (playerId, callback) => {
        const query = `
            SELECT 
                b.bookingId, 
                b.booking_date, 
                b.start_time, 
                b.end_time, 
                c.name AS courtName, 
                a.name AS arenaName
            FROM bookings b
            JOIN courts c ON b.courtId = c.courtId
            JOIN arenas a ON c.arenaId = a.arenaId
            WHERE b.playerId = ? 
              AND b.status = 'Booked'
              AND (
                  DATE(b.booking_date) = CURDATE() + INTERVAL 1 DAY 
                  OR (DATE(b.booking_date) = CURDATE() AND TIMESTAMPDIFF(HOUR, NOW(), CONCAT(b.booking_date, ' ', b.start_time)) BETWEEN 0 AND 2)
              )
            ORDER BY b.booking_date, b.start_time
        `;
        db.query(query, [playerId], callback);
    },
};

module.exports = NotificationModel;
