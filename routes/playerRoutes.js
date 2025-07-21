const express = require("express");
const router = express.Router();
const playerController = require("../controllers/playerController");
const bookingController = require("../controllers/bookingController");
const invoiceController = require("../controllers/invoiceController");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");
const { uploadPlayerProfileImage } = require("../middleware/uploadMiddleware");
const playerReviewController = require("../controllers/playerReviewController");
const playerInvoiceController = require("../controllers/playerInvoiceController");

//routes needed for retrieve bookings
router.get("/bookings", authenticateUser, authorizeRole(["Player"]), playerController.getBookings);

//routes needed for change password
router.put('/change-password',  authenticateUser, authorizeRole(["Player"]), playerController.changePassword);
router.post("/create-booking", authenticateUser, authorizeRole(["Player"]), bookingController.setABooking);

//routes needed for player profile
router.get("/profile", authenticateUser, authorizeRole(["Player"]), playerController.getPlayerProfile);
router.put("/profile", authenticateUser, authorizeRole(["Player"]), playerController.updatePlayerProfile);
router.post("/profile/upload", authenticateUser, authorizeRole(["Player"]), uploadPlayerProfileImage.single("image"), playerController.uploadProfileImage);
router.get("/profile/image", authenticateUser, authorizeRole(["Player"]), playerController.getProfileImage);

//routes needed for invoices
router.get("/invoices", authenticateUser, authorizeRole(["Player"]), invoiceController.getPlayerInvoices);

//routes needed for player reviews
router.post("/reviews", authenticateUser, authorizeRole(["Player"]), playerReviewController.addReview);
router.get("/reviews/:courtId", authenticateUser, authorizeRole(["Player"]), playerReviewController.getReviewsByCourtId);
router.get("/reviews/:courtId/stats", authenticateUser, authorizeRole(["Player"]), playerReviewController.getReviewStats);
router.get("/reviews/:courtId/average", authenticateUser, authorizeRole(["Player"]), playerReviewController.getAverageRatingByCourtId);
router.get("/generate-invoice/:bookingId", playerInvoiceController.handleInvoiceGeneration);
router.get("/download-invoice/:filename", playerInvoiceController.downloadInvoice);
router.get("/get-owner-id/:bookingId", authenticateUser, authorizeRole(["Player"]), playerInvoiceController.getOwnerIdAndArenaIdForBooking);
router.post("/update-payments-table", authenticateUser, authorizeRole(["Player"]), playerInvoiceController.updatePaymentsTable);
router.get("/reviewsNoAuth/:courtId/stats", playerReviewController.getReviewStats);
router.get("/reviewsNoAuth/:courtId/average", playerReviewController.getAverageRatingByCourtId);


module.exports = router;

