const PlayerReview = require("../models/playerReviewModel");

exports.getReviewsByCourtId = async (req, res) => {
  try {
    const courtId = req.params.courtId;
    console.log("Fetching reviews for courtId:", courtId);
    
    const results = await PlayerReview.getReviewsByCourtId(courtId);
    console.log("Reviews fetched:", results);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
};

exports.addReview = async (req, res) => {
  try {
    const playerId = req.user.userId;
    const { courtId, rating, comment } = req.body;

    if (!courtId || !rating || !comment) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const court = await PlayerReview.getArenaIdByCourtId(courtId);
    if (!court) {
      return res.status(404).json({ error: "Court not found" });
    }
    
    const arenaId = court.arenaId;
    console.log("Arena ID fetched:", arenaId);

    await PlayerReview.addReview(playerId, arenaId, courtId, rating, comment);
    res.status(201).json({ message: "Review submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
};

exports.getAverageRatingByCourtId = async (req, res) => {
  try {
    const courtId = req.params.courtId;
    
    const result = await PlayerReview.getAverageRatingByCourtId(courtId);
    const avg = result.averageRating;
    res.json({ averageRating: avg ? parseFloat(avg).toFixed(1) : "0.0" });
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
};

exports.getReviewStats = async (req, res) => {
  try {
    const courtId = req.params.courtId;
    
    const result = await PlayerReview.getReviewStats(courtId);
    const { total_reviews, total_ratings } = result;
    res.json({ total_reviews, total_ratings });
  } catch (err) {
    res.status(500).json({ error: err.message || err });
  }
};