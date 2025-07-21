const PlayerBooking = require("../models/bookingModel");
const invoiceService = require("../services/invoiceService");
const path = require("path");

exports.setABooking = async (req, res) => {
    const { courtId, booking_date, start_time, end_time, total_price, payment_status, status } = req.body;
    const playerId = req.user.userId;
    const ownerId = req.body.owner_id; 
    const arenaId = req.body.arenaId; 
    //console.log("Booking data received:", req.body); // Debugging line
    //console.log("Player ID:", playerId); // Debugging line

    if (!courtId || !booking_date || !start_time || !end_time || !total_price || !payment_status || !status || !ownerId || !arenaId) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        PlayerBooking.setABooking({ playerId, courtId, booking_date, start_time, end_time, total_price, payment_status, status, ownerId, arenaId }, (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            if (results.affectedRows === 0) {
                return res.status(400).json({ error: "Failed to create booking" });
            }
            // Fetch the last booking ID for the player
            PlayerBooking.getIdOfLastBooking(playerId, (err, bookingId) => {
                if (err) { 
                    console.error("Error fetching last booking ID:", err);
                    return res.status(500).json({ error: "Failed to fetch booking ID" });
                }
                if (!bookingId) {
                    return res.status(404).json({ error: "No bookings found for this player" });
                }
                console.log("Booking ID returned:", bookingId); // Debugging line
                res.status(201).json({ bookingId: bookingId }); // Return the booking ID
                //console.log("Booking ID returned:", bookingId); // Debugging line
            });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBookingTimesByCourtId = async (req, res) => {
    const courtId = req.params.courtId;
    const bookingDate = req.query.date;

    if (!courtId) {
        return res.status(400).json({ error: "Court ID is required" });
    }

    try {
        PlayerBooking.getBookingTimesByCourtId(courtId, bookingDate, (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.status(200).json(results);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBookingDetailsForPayment = async (req, res) => {
    const bookingId = req.params.bookingId;

    if (!bookingId) {
        return res.status(400).json({ error: "Booking ID is required" });
    }

    try {
        PlayerBooking.getBookingDetailsForPayment(bookingId, (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ error: "Booking not found" });
            }
            console.log("Booking details for payment:", results[0]); // Debugging line
            res.status(200).json(results[0]);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


