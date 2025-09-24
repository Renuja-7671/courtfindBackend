const PlayerInvoices = require('../models/invoicesModel');
exports.getPlayerInvoices = async (req, res) => {
    try {
        const playerId = req.user.userId;

        const results = await PlayerInvoices.getPlayerInvoicesByPlayerId(playerId);

        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching player invoices:", err);
        res.status(500).json({ error: "Failed to fetch invoices" });
    }
};