const db = require('../config/db');

exports.getArenaRevenues = async (ownerId) => {
  const currentYear = new Date().getFullYear();

  const sql = `
    SELECT a.name, SUM(p.amount) AS total
    FROM payments p
    JOIN arenas a ON p.arenaId = a.arenaId
    WHERE p.ownerId = ?
      AND p.playerId IS NOT NULL
      AND YEAR(p.paid_at) = ?
    GROUP BY a.name
  `;

  const [results] = await db.promise().query(sql, [ownerId, currentYear]);
  return results;
};

exports.getMostBookedCourts = async (ownerId) => {
  const query = `
    SELECT c.name AS courtName, a.name AS arenaName, COUNT(b.bookingId) AS bookingsCount
    FROM bookings b
    JOIN courts c ON b.courtId = c.courtId
    JOIN arenas a ON c.arenaId = a.arenaId
    WHERE a.owner_id = 2
    GROUP BY c.courtId
    ORDER BY bookingsCount DESC
    LIMIT 5;
  `;
  const [results] = await db.promise().query(query, [ownerId]);
  return results;
};
