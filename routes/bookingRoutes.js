const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");
const { getBookingDetailsForPayment, handlePaymentSuccess } = require('../controllers/bookingController');


router.post('/payment/:bookingId', getBookingDetailsForPayment);



module.exports = router;