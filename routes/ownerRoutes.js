const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/ownerController");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");
//const { changePassword } = require('../controllers/ownerController');
const loginActivityController = require('../controllers/loginActivityController');
const reportController = require('../controllers/reportController');


router.get("/dashboardbcb", authenticateUser, authorizeRole(["Owner"]), ownerController.dashboard);
router.post("/manage-courts", authenticateUser, authorizeRole(["Owner"]), ownerController.manageCourts);
router.put('/change-password',  authenticateUser, authorizeRole(["Owner"]), ownerController.changePassword);
router.get("/profile", authenticateUser, authorizeRole(["Owner"]), ownerController.getOwnerProfile);
router.put("/profile", authenticateUser, authorizeRole(["Owner"]), ownerController.updateOwnerProfile);
router.post("/profile/upload", authenticateUser, authorizeRole(["Owner"]), upload.single('image'), ownerController.uploadProfileImage);
router.get("/profile/image", authenticateUser, authorizeRole(["Owner"]), ownerController.getProfileImage);

//Owner Dashboard routes
router.get('/dashboard/stats', authenticateUser, authorizeRole(["Owner"]), ownerController.getStats);
router.get('/dashboard/income-overview/:year', authenticateUser, authorizeRole(["Owner"]), ownerController.getIncomeOverview);
router.get('/dashboard/recent-bookings', authenticateUser, authorizeRole(["Owner"]), ownerController.getRecentBookings);
router.get('/dashboard/payment-history', authenticateUser, authorizeRole(["Owner"]), ownerController.getPaymentHistory);
router.get('/arena-revenue-distribution',authenticateUser, authorizeRole(["Owner"]), ownerController.getArenaRevenueDistribution);
router.get('/dashboard/most-booked-courts', authenticateUser, authorizeRole(["Owner"]), reportController.getMostBookedCourts);
router.get('/dashboard/get-total-income-for-year/:year', authenticateUser, authorizeRole(["Owner"]), ownerController.getTotalIncomeForYear);



//Arena Bookings routes
router.get('/arena-bookings', authenticateUser, authorizeRole(["Owner"]), ownerController.fetchArenaBookings);
router.put("/arena-bookings/:bookingId", authenticateUser, authorizeRole(["Owner"]), ownerController.updateCancelStatus);
router.get("/arena-bookings/allArenas", authenticateUser, authorizeRole(["Owner"]), ownerController.fetchArenasOfOwner);
router.get("/arena-bookings/:arenaId", authenticateUser, authorizeRole(["Owner"]), ownerController.fetchSelectedArenaBookings);
router.get("/arena-bookings/filter/:arenaId/:courtName", authenticateUser, authorizeRole(["Owner"]), ownerController.fetchFilteredArenaBookings);
router.get("/arena-bookings/courts/:arenaId", authenticateUser, authorizeRole(["Owner"]), ownerController.fetchCourtsByArenaId);

//My Profit Dashboard Routes
router.get("/my-profit/total-revenue", authenticateUser, authorizeRole(["Owner"]), ownerController.getTotalRevenue);
router.get("/my-profit/yearly-chart", authenticateUser, authorizeRole(["Owner"]), ownerController.getYearlyChartData);
router.get("/my-profit/monthly-chart", authenticateUser, authorizeRole(["Owner"]), ownerController.getMonthlyChartData);
router.get("/my-profit/payment-history", authenticateUser, authorizeRole(["Owner"]), ownerController.getPaymentHistoryForProfit);
router.get("/my-profit/transactions", authenticateUser, authorizeRole(["Owner"]), ownerController.getAllTransactions);
router.get('/my-profit/current-month-revenue', authenticateUser, authorizeRole(["Owner"]),ownerController.getCurrentMonthRevenue);

//Courtwise Profit Page Routes
router.get("/arenas", authenticateUser, authorizeRole(["Owner"]), ownerController.getOwnerArenas);
router.get("/arenas/:arenaId", authenticateUser, authorizeRole(["Owner"]), ownerController.getArenaDetails);
router.get('/arenas/:arenaId/yearly-chart', ownerController.getArenaCourtYearlyData);
router.get('/top-courts', authenticateUser, authorizeRole(["Owner"]), ownerController.getTopEarningCourts);
router.get('/player-activity', authenticateUser, authorizeRole(["Owner"]), ownerController.getPlayerBehaviorAnalysis);

router.get('/activity-summary', authenticateUser, authorizeRole(["Owner"]), loginActivityController.getActivitySummary);
router.get('/login-times', authenticateUser, authorizeRole(["Owner"]), loginActivityController.getLoginTimes);
router.post('/add-login-record', authenticateUser, authorizeRole(["Owner"]), loginActivityController.addLoginRecord);

router.get('/generate-arena-invoice/:arenaId', ownerController.generateArenaInvoice);
router.post('/update-payments-table-for-arena-add', authenticateUser, authorizeRole(["Owner"]), ownerController.updatePaymentsTableForArenaAdd);

module.exports = router;
