const path = require("path");
const PlayerBooking = require("../models/bookingModel");
const { generateInvoicePDF } = require("../services/invoiceService");
const { uploadPDFToCloudinary } = require("../utils/cloudinaryUpload");
const fs = require("fs");

exports.handleInvoiceGeneration = async (req, res) => {
  const { bookingId } = req.params;

  console.log('=== BOOKING INVOICE GENERATION START ===');
  console.log('Booking ID:', bookingId);

  try {
    // Step 1: Get booking details
    const bookingData = await new Promise((resolve, reject) => {
      PlayerBooking.getFullBookingDetails(bookingId, (err, data) => {
        if (err || !data || data.length === 0) {
          console.error("Booking not found:", err);
          reject(new Error("Booking not found"));
        } else {
          console.log('Booking details retrieved:', data[0]);
          resolve(data[0]);
        }
      });
    });

    const booking = bookingData;

    // Step 2: Create temp directory and file path
    const tempDir = path.join(__dirname, "..", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log('Temp directory created');
    }

    const timestamp = Date.now();
    const localPath = path.join(tempDir, `booking_invoice_${bookingId}_${timestamp}.pdf`);
    const fileName = `booking_invoice_${bookingId}_${timestamp}.pdf`;

    // Step 3: Generate PDF
    console.log('Generating PDF...');
    await generateInvoicePDF(booking, localPath);
    console.log('PDF generated successfully');

    // Step 4: Verify PDF was created
    if (!fs.existsSync(localPath)) {
      throw new Error('PDF file was not created');
    }

    const fileSize = fs.statSync(localPath).size;
    console.log('PDF file size:', fileSize, 'bytes');

    if (fileSize === 0) {
      throw new Error('PDF file is empty');
    }

    // Step 5: Upload to Cloudinary
    console.log('Starting Cloudinary upload...');
    const cloudinaryUrl = await uploadPDFToCloudinary(localPath, fileName);
    console.log('Cloudinary upload completed:', cloudinaryUrl);

    // Step 6: Clean up local file
    try {
      fs.unlinkSync(localPath);
      console.log('Local file cleaned up');
    } catch (deleteErr) {
      console.warn('Could not delete local file:', deleteErr.message);
    }

    // Step 7: Update database with Cloudinary URL
    await new Promise((resolve, reject) => {
      PlayerBooking.updateInvoiceAndPaymentStatus(
        bookingId,
        cloudinaryUrl, // Store the Cloudinary URL instead of local path
        (updateErr) => {
          if (updateErr) {
            console.error('Error updating booking:', updateErr);
            reject(new Error("Failed to update booking"));
          } else {
            console.log('Booking updated with invoice URL');
            resolve();
          }
        }
      );
    });

    console.log('=== BOOKING INVOICE GENERATION SUCCESS ===');

    // Return success response
    res.json({
      message: "Invoice generated successfully",
      invoiceUrl: cloudinaryUrl,
      success: true,
      bookingId: bookingId
    });

  } catch (error) {
    console.error('=== BOOKING INVOICE GENERATION ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);

    res.status(500).json({
      message: "Error generating or uploading invoice",
      error: error.message,
      success: false
    });
  }
};

exports.downloadInvoice = (req, res) => {
  const filename = req.params.filename;
  console.log("Downloading invoice:", filename);
  const filePath = path.join(__dirname, "../uploads/invoices", filename);

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("File download error:", err);
      res.status(404).json({ message: "File not found" });
    } else {
      console.log("File downloaded successfully:", `CourtFind-Invoice.pdf`);
    }
  });
};

exports.getOwnerIdAndArenaIdForBooking = (req, res) => {
  const bookingId = req.params.bookingId;

  if (!bookingId) {
    return res.status(400).json({ error: "Booking ID is required" });
  }

  PlayerBooking.getOwnerIdForBooking(bookingId, (err, result) => {
    if (err) {
      console.error("Error fetching owner ID:", err);
      return res.status(500).json({ error: "Failed to fetch owner ID" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    const ownerId = result.ownerId;
    const arenaId = result.arenaId;
    console.log("Owner ID and Arena ID fetched successfully:", ownerId, arenaId);
    // Return both ownerId and arenaId
    res.status(200).json({ ownerId, arenaId });
  });
};

exports.updatePaymentsTable = (req, res) => {
  const { bookingId, ownerId, arenaId, total } = req.body;
  const playerId = req.user.userId;

  if (!bookingId || !ownerId || !total) {
    return res.status(400).json({ error: "Booking ID, Owner ID, and Total are required" });
  }
  const paymentDesc = `Payment for booking ${bookingId}`;
  const payment_method = "Stripe";
  console.log("Updating payments table for booking:", bookingId, "Owner ID:", ownerId, "Total:", total, "arenaId:", arenaId, "playerId:", playerId);  

  PlayerBooking.updatePaymentsTable(bookingId, paymentDesc, total, payment_method, ownerId, arenaId, playerId,  (err) => {
    if (err) {
      console.error("Error updating payments table:", err);
      return res.status(500).json({ error: "Failed to update payments table" });
    }

    res.status(200).json({ message: "Payments table updated successfully" });
  });
}
