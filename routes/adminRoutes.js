const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const sportController = require("../controllers/sportController");
const arenaController = require("../controllers/arenaController");
const reviewController = require("../controllers/reviewController");
const contactController = require("../controllers/contactController");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

// Protect routes to ensure only Admins can access them
router.get("/dashboard", authenticateUser, authorizeRole(["Admin"]), adminController.dashboard);
router.get("/profile", authenticateUser, authorizeRole(["Admin"]), adminController.getAdminProfile);
router.put("/profile", authenticateUser, authorizeRole(["Admin"]), adminController.updateAdminProfile);
// Pricing routes (protected by admin authentication)
router.get('/pricing', authenticateUser, authorizeRole(['Admin']), adminController.getAllPricing);
router.put('/pricing', authenticateUser, authorizeRole(['Admin']), adminController.updatePricing);
router.post('/pricing', authenticateUser, authorizeRole(['Admin']), adminController.addPricing);
router.delete('/pricing/:id', authenticateUser, authorizeRole(['Admin']), adminController.deletePricing);

//routes needed for sports
router.get("/sports", authenticateUser, authorizeRole(["Admin"]), sportController.getAllSports);
router.put("/sports/:sportId", authenticateUser, authorizeRole(["Admin"]), sportController.updateSport);
router.post("/sports", authenticateUser, authorizeRole(["Admin"]), sportController.addSport);
router.delete("/sports/:sportId", authenticateUser, authorizeRole(["Admin"]), sportController.deleteSport);

//routes needed for reviews
router.get("/reviews", authenticateUser, authorizeRole(["Admin"]), reviewController.getAllReviews);
//routes needed for messages from website visitors
router.get("/messages", authenticateUser, authorizeRole(["Admin"]), contactController.getAllMessages);
router.put("/messages/:id/status", authenticateUser, authorizeRole(["Admin"]), contactController.updateMessageStatus);


// Player management routes 
router.get('/players', authenticateUser, authorizeRole(['Admin']), adminController.getAllPlayers);
router.get('/players/:id', authenticateUser, authorizeRole(['Admin']), adminController.getPlayerById);
router.delete('/players/:id', authenticateUser, authorizeRole(['Admin']), adminController.deletePlayer);

// owner management routes 
router.get('/owners', authenticateUser, authorizeRole(['Admin']), adminController.getAllOwners);
router.get('/owners/:id', authenticateUser, authorizeRole(['Admin']), adminController.getOwnerById);
router.delete('/owners/:id', authenticateUser, authorizeRole(['Admin']), adminController.deleteOwner);

//analytics routes
router.get('/user-stats', authenticateUser, authorizeRole(['Admin']), adminController.getUserStats);
router.get('/revenue-by-activity', authenticateUser, authorizeRole(['Admin']), adminController.getRevenueByActivity);
router.get('/top-rated-arenas', authenticateUser, authorizeRole(['Admin']), adminController.getTopRatedArenas);
router.get('/revenue-breakdown', authenticateUser, authorizeRole(['Admin']), adminController.getRevenueBreakdown);

//profit analysis routes
router.get('/monthly-revenue-analysis', authenticateUser, authorizeRole(['Admin']), adminController.getMonthlyRevenueAnalysis);

module.exports = router;