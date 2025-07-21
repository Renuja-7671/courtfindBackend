const db = require("../config/db");

const review={
    getReviewData: (callback) => {
        const query = `SELECT 
                        a.arenaId,
                        a.name AS arenaName,
                        AVG(r.rating) AS averageRating
                    FROM 
                        arenas a
                        LEFT JOIN reviews r ON a.arenaId = r.arenaId
                    GROUP BY 
                        a.arenaId, a.name;
                    `;
        db.query(query, callback);
    }
}

module.exports = review;
