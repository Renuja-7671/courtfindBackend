const db = require("../config/db");

const PlayerBooking = {
    getBookingsByPlayerId: (playerId, callback) => {
        const query = `SELECT a.name,c.name AS courtName, b.booking_date, b.start_time, b.end_time, b.status, a.image_url, b.payment_status
                        FROM bookings b, arenas a, courts c
                        WHERE b.arenaId = a.arenaId AND b.courtId = c.courtId AND b.playerId = ?;`;
        db.query(query, [playerId], callback);
    },
    setABooking: (bookingData, callback) => {
        const { playerId, courtId, booking_date, start_time, end_time, total_price, payment_status, status, ownerId, arenaId } = bookingData;
        const query = "INSERT INTO bookings (playerId, courtId, booking_date, start_time, end_time, total_price, payment_status, status, ownerId, arenaId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
        db.query(query, [playerId, courtId, booking_date, start_time, end_time, total_price, payment_status, status, ownerId, arenaId], callback);
    },
    getBookingTimesByCourtId: (courtId, bookingDate, callback) => {
        const query = "SELECT start_time, end_time FROM bookings WHERE courtId = ? AND booking_date = ? AND payment_status = 'Paid'";
        db.query(query, [courtId, bookingDate], callback);
    },
    getIdOfLastBooking: (playerId, callback) => {
        const query = "SELECT bookingId FROM bookings WHERE playerId = ? ORDER BY bookingId DESC LIMIT 1;";
        db.query(query, [playerId], (err, results) => {
            if (err) {
                return callback(err);
            }
            if (results.length > 0) {
                return callback(null, results[0].bookingId);
            } else {
                return callback(null, null); // No bookings found
            }
        });
    },
    getBookingDetailsForPayment: (bookingId, callback) => {
        const query = `
            SELECT b.bookingId, b.total_price, b.payment_status, b.ownerId, a.name AS arena_name, c.name AS court_name
            FROM bookings b
            JOIN arenas a ON b.arenaId = a.arenaId
            JOIN courts c ON b.courtId = c.courtId
            WHERE b.bookingId = ?;
        `;
        db.query(query, [bookingId], callback);
    },
    updateInvoiceAndPaymentStatus: (bookingId, invoiceUrl, callback) => {
        const query = `
            UPDATE bookings
            SET payment_status = 'Paid',
                invoices_url = ?
            WHERE bookingId = ?;
        `;
        db.query(query, [invoiceUrl, bookingId], callback);
        },

    getFullBookingDetails: (bookingId, callback) => {
        const query = `
            SELECT b.bookingId, b.booking_date, b.start_time, b.end_time, b.total_price, 
                    b.status, b.payment_status, b.created_at,
                    u.firstName, u.lastName, u.email,
                    c.name AS court_name,
                    a.name AS arena_name
            FROM bookings b
            JOIN users u ON b.playerId = u.userId
            JOIN courts c ON b.courtId = c.courtId
            JOIN arenas a ON b.arenaId = a.arenaId
            WHERE b.bookingId = ?;
        `;
        db.query(query, [bookingId], callback);
        },

    getOwnerIdForBooking: (bookingId, callback) => {
        const query = "SELECT ownerId, arenaId FROM bookings WHERE bookingId = ?;";
        db.query(query, [bookingId], (err, results) => {
            if (err) {
                return callback(err);
            }
            if (results.length > 0) {
                return callback(null, results[0]);
            } else {
                return callback(new Error("Booking not found"));
            }
        });
    },

    updatePaymentsTable: (bookingId, paymentDesc, total, payment_method, ownerId, arenaId, playerId, callback) => {
        const query = `
      INSERT INTO payments (amount, payment_method, bookingId, arenaId, ownerId, playerId, paymentDesc)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    db.query(query, [total, payment_method, bookingId, arenaId, ownerId, playerId, paymentDesc], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return callback(err);
      }
      callback(null, results);
    });
    }

    
};

module.exports = PlayerBooking;
