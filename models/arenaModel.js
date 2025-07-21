const db = require("../config/db");
const { addArena } = require("../controllers/ownerController");

const arena={
    getAllArenas: (callback) => {
        const query = "SELECT a.arenaId, a.name AS arenaName, a.city, a.country, a.description, a.image_url, c.name AS courtName, c.courtId, c.sport FROM arenas a, courts c WHERE a.arenaId = c.arenaId AND a.paidStatus = 'Paid'";
        db.query(query, callback);
    },

    searchArenas: (sport, venue, callback) => {
        let query = "SELECT a.arenaId, a.name AS arenaName, a.city, a.country, a.description, a.image_url, c.name AS courtName, c.courtId, c.sport FROM arenas a, courts c WHERE a.arenaId = c.arenaId AND a.paidStatus = 'Paid'";
        const params = [];

        if (sport) {
            query += " AND c.sport  LIKE ?";
            params.push(`%${sport}%`);
        }

        if (venue) {
            query += " AND (a.name LIKE ? OR a.city LIKE ?)";
            params.push(`%${venue}%`, `%${venue}%`);
        }

        db.query(query, params, callback);
    },

    addArena: (ownerId, name, city, description, image_url, callback) => {
        const query = "INSERT INTO arenas (owner_id, name, city, description, image_url) VALUES (?, ?, ?, ?, ?)";
        db.query(query, [ownerId, name, city, description, image_url], callback);
    },

    getArenaByRating: (callback) => {
        const query = "SELECT a.arenaId, a.city, a.name, a.country, a.description, a.image_url, AVG(r.rating) AS average_rating FROM arenas a JOIN reviews r ON a.arenaId = r.arenaId GROUP BY a.arenaId ORDER BY average_rating DESC";
        db.query(query, callback);
    },

        // Get arenas by owner 
    getArenasByOwner: (ownerId, callback) => {
    const query = "SELECT arenaId, name FROM arenas WHERE owner_id = ? AND paidStatus = 'Paid'";
    db.query(query, [ownerId], callback);
    },

    // Update arena name
    updateArenaName: (arenaId, name, callback) => {
    const query = "UPDATE arenas SET name = ? WHERE arenaId = ?";
    db.query(query, [name, arenaId], callback);
    },

    // Delete arena
    removeArena: (arenaId, callback) => {
    const query = "DELETE FROM arenas WHERE arenaId = ?";
    db.query(query, [arenaId], callback);
    },

    // get arenas with arenaStatus pending for owner
    getPendingArenas: (userId, callback) => {
        const query = `SELECT a.arenaId, a.name AS arenaName, a.city, a.country, a.description, a.image_url,
         u.firstName, u.lastName, u.mobile, u.province, u.email 
         FROM arenas a, users u 
         WHERE a.owner_id = u.userId AND a.owner_id = ? AND a.arenaStatus = 'Pending'`;
        db.query(query, [userId], callback);
    },

    // get pending arenas for admin
    getPendingArenasForAdmin: (callback) => {
        const query = `SELECT a.arenaId, a.name AS arenaName, a.city, a.country, a.description, a.image_url,
         u.firstName, u.lastName, u.mobile, u.province, u.email 
         FROM arenas a, users u 
         WHERE a.owner_id = u.userId AND a.arenaStatus = 'Pending'`;
        db.query(query, callback);
    },

    //update arena status to Approved
    updateArenaStatus: (arenaId, declinedReason, status, callback) => {
        const query = "UPDATE arenas SET arenaStatus = ?, declinationReason = ? WHERE arenaId = ?";
        db.query(query, [status, declinedReason, arenaId], callback);
    },

    getPricingForNewArena: (callback) => {
        const query = "SELECT price FROM pricing WHERE activity_name = 'Price for new arena addition'";
        db.query(query, callback);
    },

    getArenasForOwnerWithStatus: (ownerId, callback) => {
        const query = `SELECT a.arenaId, a.name AS arenaName, a.city, a.country, a.description, a.image_url, a.arenaStatus, a.declinationReason
                       FROM arenas a
                       WHERE a.owner_id = ? AND a.paidStatus = 'Pending'`;
        db.query(query, [ownerId], callback);
    },

    getArenaDetails: (arenaId, callback) => {
        const query = `SELECT * FROM arenas WHERE arenaId = ?`;
        db.query(query, [arenaId], callback);
    },

    markAsPaid: (arenaId, invoiceUrl, callback) => {
        const query = `UPDATE arenas
                        SET paidStatus = 'Paid', invoiceUrl = ?
                        WHERE arenaId = ?;`;
        db.query(query, [invoiceUrl, arenaId], callback);
    },

    setPriceForNewArena: (arenaId, price, callback) => {
        const query = "UPDATE arenas SET amount = ? WHERE arenaId = ?";
        db.query(query, [price, arenaId], callback);
    },
    };

module.exports = arena;