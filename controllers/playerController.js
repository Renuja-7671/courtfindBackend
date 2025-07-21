const PlayerBooking = require("../models/bookingModel");
const User = require("../models/userModel");
const bcrypt = require('bcrypt');
const db = require('../config/db'); // MySQL connection
const jwt = require('jsonwebtoken');
const Player = require('../models/playerModel');
const Sport = require('../models/sportModel');

exports.getBookings = (req, res) => {
    const playerId = req.user.userId;

    PlayerBooking.getBookingsByPlayerId(playerId, (err, results) => {
        if (err) {
            console.error("Error fetching player bookings:", err);
            return res.status(500).json({ error: "Failed to fetch bookings" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No booking found" });
        }
        //console.log("These are the bookings: ", results);

        res.status(200).json(results);
    });
};

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
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ message: "Incorrect current password" });
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateSql = 'UPDATE users SET password = ? WHERE userId = ?';
        db.query(updateSql, [hashedPassword, userId], (err, result) => {
            if (err) return res.status(500).json({ message: "Error updating password" });

            res.json({ message: "Password updated successfully" });
        });
    });
};

// Get Player Profile
exports.getPlayerProfile = async (req, res) => {
    try {
        const playerId = req.user.userId;
        //console.log("The ID of the user: ", playerId);
        User.getOwnerProfile(playerId, async (err, results) =>{
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

// Update Player Profile
exports.updatePlayerProfile = async (req, res) => {
    try {
        const playerId = req.user.userId;
        const profileData = req.body;
        //console.log("The profile data: ", profileData);
        User.updateOwnerProfile(playerId, profileData, (err, results) =>{
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
        //console.log("The came file is: ",req.file);

        const imageUrl = `/uploads/player/${req.file.filename}`; // Store relative path
        const userId = req.user.userId; // Extract from auth token
        //console.log("The image url now is:", imageUrl);

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
        //console.log("The ID of the user for fetching the image: ", userId);
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

// Home Page
exports.getHomePageData = async (req, res) => {
    try {
        const { sport, venue } = req.query;
        const responseData = {};

        // Get arenas (filtered)
        Player.searchArenas(sport, venue, (err, arenas) => {
            if (err) {
                console.error("Database error fetching arenas:", err);
                return res.status(500).json({ message: "Database error fetching arenas", error: err });
            }
            responseData.arenas = arenas;

            // Get all sports
            Sport.getAllSports((err, sports) => {
                if (err) {
                    console.error("Database error fetching sports:", err);
                    return res.status(500).json({ message: "Database error fetching sports", error: err });
                }
                responseData.sports = sports;

                // Send the combined response
                res.json(responseData);
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Unexpected error", error });
    }
};

exports
