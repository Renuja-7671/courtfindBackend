const db = require("../config/db");
const Invoice = {
    getPlayerInvoicesByPlayerId: (playerId, callback) => {
        const query = `
            SELECT a.name, b.booking_date, b.start_time, b.end_time, b.status, a.image_url,b.invoices_url
            FROM bookings b
            JOIN arenas a ON b.arenaId = a.arenaId
            WHERE b.playerId = ?
            ORDER BY b.booking_date DESC;
        `;
        db.query(query, [playerId], callback);
    }
};

module.exports = Invoice;
