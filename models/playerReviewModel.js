const db = require("../config/db");

const PlayerReview = {
  // Get reviews for a specific court
  getReviewsByCourtId: (courtId, callback) => {
    const query = `
            SELECT 
        u.firstName, 
        u.lastName, 
        r.comment, 
        r.rating, 
        r.created_at
      FROM 
        reviews r
      JOIN users u ON r.playerId = u.userId
      JOIN courts c ON r.courtId = c.courtId
      WHERE 
        r.courtId = ?
      ORDER BY 
        r.created_at DESC`

    db.query(query, [courtId], callback);
  },

  // Add a new review
  addReview: (playerId, arenaId, courtId, rating, comment, callback) => {
    const query = `
      INSERT INTO reviews (playerId, arenaId, courtId, rating, comment, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    db.query(query, [playerId, arenaId, courtId, rating, comment], callback);
  },

  //get arenaId from courtId
  getArenaIdByCourtId: (courtId, callback) => {
    const query = `SELECT arenaId FROM courts WHERE courtId = ?`;
    db.query(query, [courtId], callback);
  },

  // Get average rating
  getAverageRatingByCourtId: (courtId, callback) => {
    const query = `SELECT AVG(rating) AS averageRating FROM reviews WHERE courtId = ?`;
    db.query(query, [courtId], callback);
  },

  // Get review stats (count and sum)
  getReviewStats: (courtId, callback) => {
    const query = `
      SELECT COUNT(*) AS total_reviews, SUM(rating) AS total_ratings
      FROM reviews
      WHERE courtId = ?
    `;
    db.query(query, [courtId], callback);
  }
};

module.exports = PlayerReview;
