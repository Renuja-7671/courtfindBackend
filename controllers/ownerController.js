const db = require('../config/db'); // MySQL connection
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const OwnerDashboard = require('../models/ownerModel');
const path = require("path");
const { generateArenaInvoicePDF } = require("../services/invoiceService");
const arena = require("../models/arenaModel");
const fs = require("fs");
const cloudinary = require("../config/cloudinary"); 

exports.changePassword = async (req, res) => {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
   

    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Fetch user from database
    const sql = 'SELECT password FROM users WHERE userId = ?';
    db.query(sql, [userId], async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = results[0];
        //const passwordMatch = await bcrypt.compare(currentPassword, user.password);

        if (currentPassword!==user.password) {
            return res.status(400).json({ message: "Incorrect current password" });
        }

        // Hash new password and update
        //const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateSql = 'UPDATE users SET password = ? WHERE userId = ?';
        db.query(updateSql, [newPassword, userId], (err, result) => {
            if (err) return res.status(500).json({ message: "Error updating password" });

            res.json({ message: "Password updated successfully" });
        });
    });
};


exports.dashboard = (req, res) => {
    res.json({ message: "Welcome to the Owner Dashboard", user: req.user });
};

exports.manageCourts = (req, res) => {
    res.json({ message: "Owner managing courts" });
};

// Get Owner Profile
exports.getOwnerProfile = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        console.log("The ID of the user: ", ownerId);
        User.getOwnerProfile(ownerId, async (err, results) =>{
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Profile not found" });
            }
            const profile = results[0];
            //console.log("The profile data: ", profile);
            res.json(profile);
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile", error });
    }
};

// Update Owner Profile
exports.updateOwnerProfile = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const profileData = req.body;
        //console.log("The profile data: ", profileData);
        User.updateOwnerProfile(ownerId, profileData, (err, results) =>{
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }
            res.json({ message: "Profile updated successfully" });
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error });
    }
};

// Upload Profile Image
exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        console.log("The came file is: ",req.file);

        const imageUrl = `${req.file.path}`; // Store relative path
        const userId = req.user.userId; // Extract from auth token

        const response = await User.updateProfileImage(userId, imageUrl);
        res.json({ message: response.message, imageUrl });
    } catch (error) {
        res.status(500).json({ message: "Error uploading profile image", error });
    }
};

// Get Profile Image
exports.getProfileImage = async (req, res) => {
    try {
        const userId = req.user.userId;
        User.getProfileImage(userId, async (err, results) =>{
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Profile image not found" });
            }
            const imageUrl = results[0].profileImage;
            //console.log("The image URL: ", imageUrl);
            res.json(imageUrl);
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile image", error });
    }
};

//Add New Arena
exports.addArena = (req, res) => {
    const ownerId = req.user.userId;  
    const { arenaName, streetName, city } = req.body;

    if (!arenaName || !streetName || !city) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const sql = 'INSERT INTO arenas (id, name, country, city) VALUES (?, ?, ?, ?)';
    db.query(sql, [ownerId, arenaName, streetName, city], (err, result) => {
        if (err) {
            console.error("Error inserting arena:", err);
            return res.status(500).json({ message: "Database error while adding arena" });
        }

        res.status(201).json({ message: "Arena added successfully", arenaId: result.insertId });
    });
};

exports.getStats = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const stats = await OwnerDashboard.fetchStats(ownerId);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
  
};

exports.getIncomeOverview = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const year = req.params.year;
        const chartData = await OwnerDashboard.fetchIncomeOverview(ownerId, year);
        res.json(chartData);
    } catch (error) {
        console.error('Error fetching income overview:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
  
};

exports.getTotalIncomeForYear = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const year = req.params.year;
        const totalIncome = await OwnerDashboard.getTotalIncomeForYear(ownerId, year);
        res.json(totalIncome);
    } catch {
        console.error('Error fetching total income:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getRecentBookings = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const bookings = await OwnerDashboard.fetchRecentBookings(ownerId);
    //console.log("The table details are : ", bookings);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPaymentHistory = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const payments = await OwnerDashboard.fetchPaymentHistory(ownerId);
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.fetchArenaBookings = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const bookingsArena = await OwnerDashboard.fetchArenaBookings(ownerId);
        console.log("The booking details are : ", bookingsArena);
        res.json(bookingsArena);
    } catch (error) {
        console.error('Error fetching arena bookings:', error);
        res.status(500).json({ message: 'Internal server error' });
        }
};

exports.fetchSelectedArenaBookings = async (req, res) => {
    try {
        const arenaId = req.params.arenaId;
        const ownerId = req.user.userId;
        const bookingsArena = await OwnerDashboard.fetchSelectedArenaBookings(ownerId, arenaId);
        console.log("The booking details are : ", bookingsArena);
        res.json(bookingsArena);
    } catch (error) {
        console.error('Error fetching selected arena bookings:', error);
        res.status(500).json({ message: 'Internal server error' });
        }
    };    
    
exports.fetchArenasOfOwner = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const arenas = await OwnerDashboard.fetchArenasOfOwner(ownerId);
        res.json(arenas);
        } catch (error) {
            console.error('Error fetching arenas of owner:', error);
            res.status(500).json({ message: 'Internal server error' });
            }
     };

exports.updateCancelStatus = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const { reason } = req.body;
        
        const updateBookingStatus = await OwnerDashboard.updateCancelStatus(bookingId, reason);
        console.log("booking status : ", updateBookingStatus);
        res.json(updateBookingStatus);
    } catch (error) {
            console.error('Error updating cancel status:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
};

exports.fetchCourtsByArenaId = async (req, res) => {
    try {
        const arenaId = req.params.arenaId;
        const courts = await OwnerDashboard.fetchCourtsByArenaId(arenaId);
        console.log("The courts are: ", courts);
        res.json(courts);
        } catch (error) {
            console.error('Error fetching courts by arena id:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
};

exports.fetchFilteredArenaBookings = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    
    const { arenaId, courtName } = req.params;
    //console.log("Filter parameters:", { arenaId, courtName });

    //console.log("Filtering bookings for:", { ownerId, arenaId, courtName });

    const bookings = await OwnerDashboard.fetchFilteredArenaBookings(
      ownerId,
      arenaId,
      courtName
    );

    res.json(bookings);
  } catch (error) {
    console.error("Error filtering arena bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//FOR MY PROFIT 
exports.getTotalRevenue = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const totalRevenue = await OwnerDashboard.fetchTotalRevenue(ownerId);
        res.json({ totalRevenue });
    } catch (error) {
        console.error('Error fetching total revenue:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getCurrentMonthRevenue = async (req, res) => {
    try {
        const ownerId = req.user.userId;  
        const currentMonthRevenue = await OwnerDashboard.fetchCurrentMonthRevenue(ownerId);
        res.json({ currentMonthRevenue });
    } catch (error) {
        console.error('Error fetching current month revenue:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getYearlyChartData = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const year = req.query.year || new Date().getFullYear(); // capture year from query
        const chartData = await OwnerDashboard.fetchYearlyChartData(ownerId, year);
        res.json(chartData);
    } catch (error) {
        console.error('Error fetching yearly chart data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getMonthlyChartData = async (req, res) => {
    console.log("Raw query params:", req.query);
    const { year, month } = req.query;
    console.log("Parsed values:", { year: typeof year, month: typeof month });
    const ownerId = req.user.userId;
    
    // Convert to numbers explicitly
    const numYear = parseInt(year) || new Date().getFullYear();
    const numMonth = parseInt(month) || new Date().getMonth() + 1;
    console.log("Final values:", { numYear, numMonth });
    
    const chartData = await OwnerDashboard.fetchMonthlyChartData(ownerId, numYear, numMonth);
    console.log(" Monthly Chart Query Params:", req.query);
    try {
        const ownerId = req.user.userId;
        const { year, month } = req.query; // Optional year/month from query params
        const chartData = await OwnerDashboard.fetchMonthlyChartData(ownerId, year, month);
        res.json(chartData);
    } catch (error) {
        console.error('Error fetching monthly chart data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const transactions = await OwnerDashboard.fetchAllTransactions(ownerId);
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getPaymentHistoryForProfit = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const payments = await OwnerDashboard.fetchPaymentHistoryForMyProfit(ownerId);
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payment history for profit:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// For courtwise profit page

// Get owner's arenas
exports.getOwnerArenas = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const arenas = await OwnerDashboard.fetchOwnerArenas(ownerId);
        res.json(arenas);
    } catch (error) {
        console.error('Error fetching owner arenas:', error);
        res.status(500).json({ error: 'Failed to fetch arenas' });
    }
};

// Get arena details
exports.getArenaDetails = async (req, res) => {
    try {
        const { arenaId } = req.params;
        const arena = await OwnerDashboard.fetchArenaDetails(arenaId);
        if (!arena) {
            return res.status(404).json({ error: 'Arena not found' });
        }
        res.json(arena);
    } catch (error) {
        console.error('Error fetching arena details:', error);
        res.status(500).json({ error: 'Failed to fetch arena details' });
    }
};

// Get arena court yearly data
exports.getArenaCourtYearlyData = async (req, res) => {
    try {
        const { arenaId } = req.params;
        const { year } = req.query;
        const chartData = await OwnerDashboard.fetchArenaCourtYearlyData(arenaId, year);
        res.json(chartData);
    } catch (error) {
        if (!arena) {
    return res.status(404).json({ error: 'Arena not found' });}
        console.error('Error fetching arena court yearly data:', error);
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
};

//Courtwise Profit's new changes
// Get Top Earning Courts (Last 3 Months)
exports.getTopEarningCourts = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const topCourts = await OwnerDashboard.fetchTopEarningCourts(ownerId);
        res.json(topCourts);
    } catch (error) {
        console.error('Error fetching top earning courts:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Analyze Player Behavior (Repeat vs New) - Last 3 Months
exports.getPlayerBehaviorAnalysis = async (req, res) => {
    try {
        const ownerId = req.user.userId;
        const result = await OwnerDashboard.analyzePlayerBehaviorLast3Months(ownerId);
        res.json(result);
    } catch (error) {
        console.error('Error analyzing player behavior:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const { uploadPDFToDrive } = require("../utils/googleDrive");
const DRIVE_FOLDER_ID = "1rPKA3sX-sv6SVcjQn3KCAxETvaj57VzT";

// Replace your generateArenaInvoice function with this:

exports.generateArenaInvoice = async (req, res) => {
  const { arenaId } = req.params;
  const price = req.query.price;

  console.log('=== ARENA INVOICE GENERATION START ===');
  console.log('Arena ID:', arenaId);
  console.log('Price:', price);

  try {
    // Step 1: Set price for arena
    await new Promise((resolve, reject) => {
      arena.setPriceForNewArena(arenaId, price, (err) => {
        if (err) {
          console.error("Error setting price for new arena:", err);
          reject(new Error("Failed to set price for new arena"));
        } else {
          console.log('Price set successfully');
          resolve();
        }
      });
    });

    // Step 2: Get arena details
    const arenaData = await new Promise((resolve, reject) => {
      arena.getArenaDetails(arenaId, (err, data) => {
        if (err || !data || data.length === 0) {
          console.error("Arena not found:", err);
          reject(new Error("Arena not found"));
        } else {
          console.log('Arena details retrieved:', data[0]);
          resolve(data[0]);
        }
      });
    });

    // Step 3: Prepare arena details for PDF
    const arenaDetails = arenaData;
    arenaDetails.amount = price;
    arenaDetails.price = price;

    // Step 4: Create temp directory and file path
    const tempDir = path.join(__dirname, "..", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
      console.log('Temp directory created');
    }

    const timestamp = Date.now();
    const localPath = path.join(tempDir, `arena_invoice_${arenaId}_${timestamp}.pdf`);
    console.log('PDF will be generated at:', localPath);

    // Step 5: Generate PDF
    console.log('Generating PDF...');
    await generateArenaInvoicePDF(arenaDetails, localPath);
    console.log('PDF generated successfully');

    // Step 6: Verify PDF was created
    if (!fs.existsSync(localPath)) {
      throw new Error('PDF file was not created');
    }

    const fileSize = fs.statSync(localPath).size;
    console.log('PDF file size:', fileSize, 'bytes');

    if (fileSize === 0) {
      throw new Error('PDF file is empty');
    }

    // Step 7: Upload to Google Drive
    console.log('Starting Google Drive upload...');
    const fileName = `arena_invoice_${arenaId}_${timestamp}.pdf`;
    
    const driveUrl = await uploadPDFToDrive(localPath, fileName, DRIVE_FOLDER_ID);
    console.log('Google Drive upload completed:', driveUrl);

    // Step 8: Clean up local file
    try {
      fs.unlinkSync(localPath);
      console.log('Local file cleaned up');
    } catch (deleteErr) {
      console.warn('Could not delete local file:', deleteErr.message);
    }

    // Step 9: Update database
    await new Promise((resolve, reject) => {
      arena.markAsPaid(arenaId, driveUrl, (updateErr) => {
        if (updateErr) {
          console.error('Error marking arena as paid:', updateErr);
          reject(new Error("Failed to update arena status"));
        } else {
          console.log('Arena marked as paid in database');
          resolve();
        }
      });
    });

    console.log('=== ARENA INVOICE GENERATION SUCCESS ===');

    // Return success response
    res.json({
      message: "Arena invoice generated successfully",
      invoiceUrl: driveUrl,
      success: true,
      arenaId: arenaId,
      price: price
    });

  } catch (error) {
    console.error('=== ARENA INVOICE GENERATION ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);

    res.status(500).json({
      message: "Error generating or uploading invoice",
      error: error.message,
      success: false
    });
  }
};

exports.updatePaymentsTableForArenaAdd = async (req, res) => {
  const { arenaId, total } = req.body;
  const ownerId = req.user.userId;

  if (!arenaId || !total) {
    return res.status(400).json({ message: "Arena ID and total amount are required" });
  }

  const paymentDesc = `Payment for arena addition: ${arenaId}`;
  const payment_method = "Stripe";

  try {
    const response = await OwnerDashboard.updatePaymentsTableForArenaAdd(arenaId, total, ownerId, paymentDesc, payment_method);
    res.json({ message: "Payment status updated successfully", data: response });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Failed to update payment status", error });
  }
}

const ownerModel = require('../models/ownerModel');

exports.getArenaRevenueDistribution = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const currentYear = new Date().getFullYear();

    const results = await OwnerDashboard.fetchArenaRevenueDistribution(ownerId, currentYear);

    const labels = results.map(r => r.name);
    const values = results.map(r => parseFloat(r.total));

    res.json({ labels, values });
  } catch (err) {
    console.error('Error fetching arena revenue distribution:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


