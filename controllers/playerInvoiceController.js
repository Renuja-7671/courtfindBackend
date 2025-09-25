const path = require("path");
const PlayerBooking = require("../models/bookingModel");
const { generateInvoicePDF } = require("../services/invoiceService");
const { uploadPDFToCloudinary } = require("../utils/cloudinaryUpload");
const fs = require("fs");

const nodemailer = require("nodemailer");

exports.handleInvoiceGeneration = async (req, res) => {
  const { bookingId } = req.params;

  console.log('Booking ID:', bookingId);

  try {
    // Step 1: Get booking details
    const bookingData = await PlayerBooking.getFullBookingDetails(bookingId);
    
    if (!bookingData) {
      console.error("Booking not found");
      return res.status(404).json({ 
        message: "Booking not found", 
        success: false 
      });
    }

    console.log('Booking details retrieved:', bookingData);
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
    await PlayerBooking.updateInvoiceAndPaymentStatus(bookingId, cloudinaryUrl);
    console.log('Booking updated with invoice URL');

    // Step 8: Send invoice link via email to customer
    try {
      // Setup nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: `Courtfind <${process.env.EMAIL_USER}>`,
        to: booking.email,
        subject: 'Courtfind Booking Invoice',
        html: `<div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">COURTFIND</div>
            <div class="header-subtitle">Your Sports Arena Booking Platform</div>
            <div class="success-icon"></div>
        </div>
        
        <!-- Content -->
        <div class="content">
            <h1 class="greeting">Booking Confirmed!</h1>
            <p class="message">
                Great news! Your court booking has been successfully confirmed. 
                Get ready for an amazing sports experience!
            </p>
            
            <div class="divider"></div>
            
            <!-- Booking Details -->
            <div class="booking-details">
                <h3>Your Booking Details</h3>
                <div class="detail-row">
                    <span class="detail-label">Arena:</span>
                    <span class="detail-value">${booking.arena_name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Court:</span>
                    <span class="detail-value">${booking.court_name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${booking.booking_date}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${booking.start_time} - ${booking.end_time}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Booking ID:</span>
                    <span class="detail-value">#${booking.bookingId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Amount:</span>
                    <span class="detail-value">Rs. ${booking.total_price}</span>
                </div>
            </div>
            
            <!-- Call to Action -->
            <div class="cta-container">
                <a href="${cloudinaryUrl}" class="download-btn" target="_blank">
                    📄 Download Your Invoice
                </a>
            </div>
            
            <!-- Additional Information -->
            <div class="additional-info">
                <h4>Important Reminders:</h4>
                <ul>
                    <li>Please arrive 10 minutes before your scheduled time</li>
                    <li>Bring appropriate sports attire and equipment</li>
                    <li>Keep your booking confirmation for entry</li>
                </ul>
            </div>
            
            <div class="divider"></div>
            
            <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
                Need help? Contact our support team or check your dashboard for more details.
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="contact-info">
                <p><strong>Courtfind Support</strong></p>
                <p>Email: <a href="mailto:courtfindbookings@gmail.com">courtfindbookings@gmail.com</a></p>
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; color: #bdc3c7;">
                © 2025 Courtfind. All rights reserved.<br>
                This email was sent to you because you made a booking on our platform.
            </p>
        </div>
    </div>`
      };

      await transporter.sendMail(mailOptions);
      console.log('Invoice email sent to:', booking.email);
    } catch (emailErr) {
      console.error('Failed to send invoice email:', emailErr);
    }

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

exports.getOwnerIdAndArenaIdForBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;

    if (!bookingId) {
      return res.status(400).json({ error: "Booking ID is required" });
    }

    const result = await PlayerBooking.getOwnerIdForBooking(bookingId);
    
    if (!result) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const ownerId = result.ownerId;
    const arenaId = result.arenaId;
    console.log("Owner ID and Arena ID fetched successfully:", ownerId, arenaId);
    
    // Return both ownerId and arenaId
    res.status(200).json({ ownerId, arenaId });
  } catch (err) {
    console.error("Error fetching owner ID:", err);
    res.status(500).json({ error: "Failed to fetch owner ID" });
  }
};

exports.updatePaymentsTable = async (req, res) => {
  try {
    const { bookingId, ownerId, arenaId, total } = req.body;
    const playerId = req.user.userId;

    if (!bookingId || !ownerId || !total) {
      return res.status(400).json({ error: "Booking ID, Owner ID, and Total are required" });
    }

    const paymentDesc = `Payment for booking ${bookingId}`;
    const payment_method = "Stripe";
    console.log("Updating payments table for booking:", bookingId, "Owner ID:", ownerId, "Total:", total, "arenaId:", arenaId, "playerId:", playerId);  

    await PlayerBooking.updatePaymentsTable(bookingId, paymentDesc, total, payment_method, ownerId, arenaId, playerId);
    
    res.status(200).json({ message: "Payments table updated successfully" });
  } catch (err) {
    console.error("Error updating payments table:", err);
    res.status(500).json({ error: "Failed to update payments table" });
  }
};