const PlayerReview = require("../models/playerReviewModel");

exports.getReviewsByCourtId = (req, res) => {
  const courtId = req.params.courtId;
  console.log("Fetching reviews for courtId:", courtId);
  PlayerReview.getReviewsByCourtId(courtId, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    console.log("Reviews fetched:", results);
    res.json(results);
  });
};

exports.addReview = (req, res) => {
  const playerId = req.user.userId; 
  const { courtId, rating, comment } = req.body;

  if (!courtId || !rating || !comment)
    return res.status(400).json({ error: "Missing fields" });

  PlayerReview.getArenaIdByCourtId(courtId, (err, results) => { 
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: "Court not found" });
    const arenaId = results[0].arenaId;
    console.log("Arena ID fetched:", arenaId);

    PlayerReview.addReview(playerId, arenaId, courtId, rating, comment, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: "Review submitted successfully" });
    });
  });
};


exports.getAverageRatingByCourtId = (req, res) => {
  const courtId = req.params.courtId;
  PlayerReview.getAverageRatingByCourtId(courtId, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    const avg = results[0].averageRating;
    res.json({ averageRating: avg ? parseFloat(avg).toFixed(1) : "0.0" });
  });
};

exports.getReviewStats = (req, res) => {
  const courtId = req.params.courtId;
  PlayerReview.getReviewStats(courtId, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    const { total_reviews, total_ratings } = results[0];
    res.json({ total_reviews, total_ratings });
  });
};
