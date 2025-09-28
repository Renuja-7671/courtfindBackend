// routes/paymentRoutes.js (Update existing payment routes)
const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");
const { getNeededInfoForBooking } = require('../controllers/bookingController');
const payhereController = require('../controllers/payhereController');

router.post('/create-payhere-hash', 
  authenticateUser, 
  authorizeRole(["Player"]), 
  payhereController.createPayHereHash
);

router.post('/payhere-notify', 
  payhereController.handlePayHereNotification
);

router.get('/verify-payhere/:orderId', 
  authenticateUser, 
  authorizeRole(["Player"]), 
  payhereController.verifyPayHerePayment
);

router.get('/payment-methods', 
  payhereController.getPaymentMethods
);

// Keep existing booking payment details route
router.get('/:bookingId', getNeededInfoForBooking);

module.exports = router;