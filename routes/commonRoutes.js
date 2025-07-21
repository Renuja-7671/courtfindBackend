const express = require("express");
const { submitContactForm } = require("../controllers/contactController");
const { chatWithGemini } = require("../controllers/geminiController");
const { getArenaCourtDetails } = require("../controllers/courtViewingController");
const { getAllSports } = require('../controllers/sportController');
const { searchArenas } = require('../controllers/arenaController');
const { getArenaByRating } = require('../controllers/arenaController');
const { getCourtsForBooking } = require('../controllers/courtController');
const { getBookingTimesByCourtId } = require('../controllers/bookingController');
const playerReviewController = require("../controllers/playerReviewController");
const loginActivityController = require('../controllers/loginActivityController');

const router = express.Router();

router.post("/contact", submitContactForm);

// chatbot route
router.post("/chat", chatWithGemini);

//Arena and court info for homepage
router.get("/arena-courts", getArenaCourtDetails);
router.get("/sport", getAllSports);
router.get("/searchArenas", searchArenas);
router.get('/arenasByRating', getArenaByRating);
router.get("/getAllSports", getAllSports);

// Court viewing route for booking
router.get("/courtsForBooking/:courtId", getCourtsForBooking);
router.get("/courtBookedTimes/:courtId", getBookingTimesByCourtId);

// Anyone can view reviews for a court
router.get("/reviews/:courtId", playerReviewController.getReviewsByCourtId);

// Get average rating for a court
router.get("/average-rating/:courtId", playerReviewController.getAverageRatingByCourtId);

module.exports = router;
