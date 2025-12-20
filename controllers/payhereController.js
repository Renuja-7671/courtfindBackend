// controllers/payhereController.js
const crypto = require('crypto');
const PlayerBooking = require("../models/bookingModel");
const ArenaPayment = require("../models/arenaPaymentModel");
const { arena } = require('../prisma/client');

// PayHere configuration (use environment variables)
const PAYHERE_MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID;
const PAYHERE_MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET;
const PAYHERE_SANDBOX = process.env.PAYHERE_SANDBOX;


const generateMD5Hash = (text) => {
  return crypto.createHash('md5').update(text).digest('hex').toUpperCase();
};

exports.createPayHereHash = async (req, res) => {
  try {
    const { merchant_id, order_id, amount, currency } = req.body;
    
    // Use the test merchant secret
    const merchantSecret = "4vfKH6EkRPTiZyQKLNW9MzgZ6PnvqLVBo2vB1cTrY3uN";
    
    // Format amount exactly as PayHere expects
    const formattedAmount = parseFloat(amount).toFixed(2);
    
    // Generate hash exactly as PayHere documentation shows
    const merchantSecretHash = generateMD5Hash(merchantSecret);
    const hashString = `${merchant_id}${order_id}${formattedAmount}${currency}${merchantSecretHash}`;
    const hash = generateMD5Hash(hashString);
    
    console.log('Hash generation:', {
      merchant_id,
      order_id,
      amount: formattedAmount,
      currency,
      hash
    });
    
    res.json({ success: true, hash });
  } catch (error) {
    console.error('Hash error:', error);
    res.status(500).json({ error: 'Hash generation failed' });
  }
};

// Handle PayHere payment notification (webhook)
exports.handlePayHereNotification = async (req, res) => {
  try {
    console.log('PayHere notification received:', req.body);

    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      custom_1, // bookingId
      custom_2, // ownerId  
      custom_3, // arenaId
      method,
      status_message,
      card_holder_name,
      card_no,
      card_expiry
    } = req.body;

    // Verify the notification signature
    const localMd5sig = generateMD5Hash(
      `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${generateMD5Hash(PAYHERE_MERCHANT_SECRET)}`
    );

    if (localMd5sig !== md5sig) {
      console.error('PayHere notification signature verification failed');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Extract booking information
    const bookingId = custom_1;
    const ownerId = custom_2;
    const arenaId = custom_3;

    // Handle payment status
    if (status_code === '2') { // Success
      console.log(`Payment successful for booking ${bookingId}`);

      // Update booking payment status
      await PlayerBooking.updateBookingPaymentStatus(bookingId, 'Paid');

      // Update payments table
      const paymentDesc = `PayHere payment for booking ${bookingId}`;
      await PlayerBooking.updatePaymentsTable(
        bookingId, 
        paymentDesc, 
        payhere_amount, 
        'PayHere', 
        ownerId, 
        arenaId, 
        null // playerId will be fetched from booking
      );

      // Store payment details
      await PlayerBooking.storePaymentDetails({
        bookingId,
        paymentId: payment_id,
        orderId: order_id,
        amount: payhere_amount,
        currency: payhere_currency,
        method: method,
        cardHolderName: card_holder_name,
        cardNo: card_no ? card_no.replace(/\*/g, 'X') : null, // Mask card number
        status: 'completed'
      });

      console.log(`Payment processing completed for booking ${bookingId}`);

    } else if (status_code === '0') { // Pending
      console.log(`Payment pending for booking ${bookingId}`);
      await PlayerBooking.updateBookingPaymentStatus(bookingId, 'Pending');

    } else { // Failed or cancelled
      console.log(`Payment failed for booking ${bookingId}: ${status_message}`);
      await PlayerBooking.updateBookingPaymentStatus(bookingId, 'Failed');
    }

    // Respond to PayHere
    res.status(200).send('OK');

  } catch (error) {
    console.error('Error handling PayHere notification:', error);
    res.status(500).json({ 
      error: 'Failed to process payment notification',
      message: error.message 
    });
  }
};

// Verify payment status
exports.verifyPayHerePayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Extract booking ID from order ID (format: COURT_123)
    const bookingId = orderId.replace('COURT_', '');

    // Get booking payment status
    const booking = await PlayerBooking.getBookingPaymentStatus(bookingId);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        error: 'Booking not found' 
      });
    }

    res.json({
      success: true,
      bookingId: bookingId,
      paymentStatus: booking.payment_status,
      bookingStatus: booking.status,
      orderId: orderId || null
    });

  } catch (error) {
    console.error('Error verifying PayHere payment:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to verify payment',
      message: error.message 
    });
  }
};

// Get payment methods supported by PayHere
exports.getPaymentMethods = (req, res) => {
  res.json({
    success: true,
    methods: [
      'VISA',
      'MASTER',
      'AMEX',
      'DISCOVER',
      'DINERS',
      'GENIE',
      'FRIMI',
      'EZCASH',
      'MCASH',
      'PAYAPP',
      'VISHWA',
      'LANKAPAY'
    ],
    currencies: ['LKR', 'USD', 'EUR', 'GBP', 'AUD'],
    sandbox: PAYHERE_SANDBOX
  });
};

exports.getNeededInfoForArenaAddition = async (req, res) => {
  try {
    const arenaId = req.params.arenaId;

    if (!arenaId) {
      return res.status(400).json({ error: "arena ID is required" });
    }

    const result = await ArenaPayment.getNeededInfoForArenaAddition(arenaId);
    
    if (!result) {
      return res.status(404).json({ error: "Arena not found" });
    }

    console.log("Needed info for arena addition:", result); // Debugging line
    res.status(200).json(result);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
};

//verify arena addition payment
exports.verifyPayHereArenaPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Extract booking ID from order ID (format: COURT_123)
    const arenaId = orderId.replace('ARENA_', '');

    // Get booking payment status
    const arena = await ArenaPayment.getArenaPaymentStatus(arenaId);

    if (!arena) {
      return res.status(404).json({ 
        success: false, 
        error: 'Arena not found' 
      });
    }

    res.json({
      success: true,
      arenaId: arenaId,
      paidStatus: arena.paidStatus,
      orderId: orderId || null
    });

  } catch (error) {
    console.error('Error verifying PayHere payment:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to verify payment',
      message: error.message 
    });
  }
};

// Update owner payments table after successful arena payment
exports.updateOwnerPaymentsTable = async (req, res) => {
  try {
    const { arenaId, ownerId, total } = req.body;
    const paymentDesc = `Payment for arena addition ${arenaId}`;
    const payment_method = "PayHere";

    if (!arenaId || !ownerId || !total) {
      return res.status(400).json({ error: "Arena ID, Owner ID, and Total are required" });
    }

    console.log("Updating owner payments table for arena:", arenaId, "Owner ID:", ownerId, "Total:", total);

    await ArenaPayment.updateOwnerPaymentsTable(arenaId, ownerId, total, paymentDesc, payment_method);

    res.json({ success: true, message: "Owner payments table updated successfully" });

  } catch (error) {
    console.error("Error updating owner payments table:", error);
    res.status(500).json({ error: "Failed to update owner payments table" });
  }
};