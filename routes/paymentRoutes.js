// routes/paymentRoutes.js (Update existing payment routes)
const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");
const { getNeededInfoForBooking } = require('../controllers/bookingController');
const payhereController = require('../controllers/payhereController');

// Payment routes for bookings
router.post('/create-payhere-hash', authenticateUser, authorizeRole(["Player"]), payhereController.createPayHereHash);
router.post('/payhere-notify', payhereController.handlePayHereNotification);
router.get('/verify-payhere/:orderId', authenticateUser, authorizeRole(["Player"]), payhereController.verifyPayHerePayment);
router.get('/payment-methods', payhereController.getPaymentMethods);
router.get('/:bookingId', getNeededInfoForBooking);

//Payment routes for arena addition
router.post('/owner/create-payhere-hash', authenticateUser, authorizeRole(["Owner"]), payhereController.createPayHereHash);
router.post('/owner/payhere-notify', payhereController.handlePayHereNotification);
router.get('/owner/verify-payhere/:orderId', authenticateUser, authorizeRole(["Owner"]), payhereController.verifyPayHereArenaPayment);
router.get('/arena-details/:arenaId', payhereController.getNeededInfoForArenaAddition);
router.post('/update-owner-payments-table', authenticateUser, authorizeRole(["Owner"]), payhereController.updateOwnerPaymentsTable);


module.exports = router;