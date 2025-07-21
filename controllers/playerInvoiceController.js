const path = require("path");
const PlayerBooking = require("../models/bookingModel");
const { generateInvoicePDF } = require("../services/invoiceService");

exports.handleInvoiceGeneration = async (req, res) => {
  const { bookingId } = req.params;

  PlayerBooking.getFullBookingDetails(bookingId, async (err, bookingData) => {
    if (err || !bookingData || bookingData.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookingData[0];
    const invoicePath = `/uploads/invoices/invoice_${bookingId}.pdf`;
    const absolutePath = path.join(__dirname, "..", invoicePath);

    try {
      await generateInvoicePDF(booking, absolutePath);

      PlayerBooking.updateInvoiceAndPaymentStatus(
        bookingId,
        invoicePath,
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ message: "Failed to update booking" });
          }
          setTimeout(() => {
          res.json({ message: "Invoice generated", invoiceUrl: invoicePath });
          }, 300);
          console.log("Invoice generated successfully--path:", invoicePath);
        }
      );
    } catch (pdfErr) {
      console.error("PDF Generation Error:", pdfErr);
      res.status(500).json({ message: "Error generating invoice" });
    }
  });
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
