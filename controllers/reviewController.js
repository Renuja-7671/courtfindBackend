const review = require("../models/reviewModel");

exports.getAllReviews = async (req, res) => {
    try {
        const results = await review.getReviewData();
        
        if (results.length === 0) {
            return res.status(404).json({ message: "No reviews found" });
        }
        //console.log("All reviews:", results); // Debugging line
        res.json(results);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
};