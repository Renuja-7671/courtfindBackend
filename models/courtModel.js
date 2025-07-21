const db = require("../config/db"); 

const court = {
    create: (courtData, callback) => {
    const {
        name,
        size,
        rate,
        sport,
        images,
        availability,
        arenaId,
    } = courtData;
    
    const query = `INSERT INTO courts (name, size, hourly_rate, sport, images, availability, arenaId) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(query, [name, size, rate, sport, JSON.stringify(images), JSON.stringify(availability), arenaId], callback);
    },

    getCourtsforbooking: (courtId, callback) => {
        const query = `SELECT a.owner_id, u.mobile, a.arenaId, a.name AS arenaName, a.city, a.country, a.description, c.courtId, c.name AS courtName, c.size, c.hourly_rate, c.sport, c.images, c.availability FROM arenas a, courts c, users u WHERE a.arenaId = c.arenaId AND a.owner_id = u.userId AND c.courtId = ?;`;
        db.query(query, [courtId], callback);
    },

    // Get courts by arena (only needed fields)  
getCourtsByArena: (arenaId, callback) => {
  const query = "SELECT courtId, name FROM courts WHERE arenaId = ?";
  db.query(query, [arenaId], callback);
},

// Update court name
updateCourtName: (courtId, name, callback) => {
  const query = "UPDATE courts SET name = ? WHERE courtId = ?";
  db.query(query, [name, courtId], callback);
},

// Delete court
deleteCourt: (courtId, callback) => {
  const query = "DELETE FROM courts WHERE courtId = ?";
  db.query(query, [courtId], callback);
}
    
};
module.exports = court;
