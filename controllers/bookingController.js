const PlayerBooking = require("../models/bookingModel");
const invoiceService = require("../services/invoiceService");
const path = require("path");

exports.setABooking = async (req, res) => {
    try {
        const { courtId, booking_date, start_time, end_time, total_price, payment_status, status } = req.body;
        const playerId = req.user.userId;
        const ownerId = req.body.owner_id; 
        const arenaId = req.body.arenaId; 
        //console.log("Booking data received:", req.body); // Debugging line
        //console.log("Player ID:", playerId); // Debugging line

        if (!courtId || !booking_date || !start_time || !end_time || !total_price || !payment_status || !status || !ownerId || !arenaId) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const result = await PlayerBooking.setABooking({ 
            playerId, courtId, booking_date, start_time, end_time, 
            total_price, payment_status, status, ownerId, arenaId 
        });
        
        if (!result) {
            return res.status(400).json({ error: "Failed to create booking" });
        }

        // Fetch the last booking ID for the player
        const bookingId = await PlayerBooking.getIdOfLastBooking(playerId);
        
        if (!bookingId) {
            return res.status(404).json({ error: "No bookings found for this player" });
        }
        
        console.log("Booking ID returned:", bookingId); // Debugging line
        res.status(201).json({ bookingId: bookingId }); // Return the booking ID
        //console.log("Booking ID returned:", bookingId); // Debugging line

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Database error" });
    }
};

exports.getBookingTimesByCourtId = async (req, res) => {
    try {
        const courtId = req.params.courtId;
        const bookingDate = req.query.date;

        if (!courtId) {
            return res.status(400).json({ error: "Court ID is required" });
        }

        const results = await PlayerBooking.getBookingTimesByCourtId(courtId, bookingDate);
        res.status(200).json(results);

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Database error" });
    }
};

exports.getBookingDetailsForPayment = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;

        if (!bookingId) {
            return res.status(400).json({ error: "Booking ID is required" });
        }

        const result = await PlayerBooking.getBookingDetailsForPayment(bookingId);
        
        if (!result) {
            return res.status(404).json({ error: "Booking not found" });
        }
        
        console.log("Booking details for payment:", result); // Debugging line
        res.status(200).json(result);

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Database error" });
    }
};