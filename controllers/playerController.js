const PlayerBooking = require("../models/bookingModel");
const User = require("../models/userModel");
const bcrypt = require('bcrypt');
const db = require('../config/db'); // MySQL connection
const jwt = require('jsonwebtoken');
const Player = require('../models/playerModel');
const Sport = require('../models/sportModel');
const NotificationModel = require('../models/playerNotificationModel');

exports.getBookings = async (req, res) => {
    try {
        const playerId = req.user.userId;
        const results = await PlayerBooking.getBookingsByPlayerId(playerId);
        
        res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching player bookings:", err);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;
       
        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Fetch user from database
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);

        if (!passwordMatch) {
            return res.status(400).json({ message: "Incorrect current password" });
        }

        // Hash new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updateUserPassword(userId, hashedPassword);

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Error changing password:", err);
        res.status(500).json({ message: "Error updating password" });
    }
};

// Get Player Profile
exports.getPlayerProfile = async (req, res) => {
    try {
        const playerId = req.user.userId;
        //console.log("The ID of the user: ", playerId);
        
        const results = await User.getOwnerProfile(playerId);
        
        if (!results) {
            return res.status(404).json({ message: "Profile not found" });
        }
        
        //console.log("The profile data: ", results);
        res.json(results);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Error fetching profile", error });
    }
};

// Update Player Profile
exports.updatePlayerProfile = async (req, res) => {
    try {
        const playerId = req.user.userId;
        const profileData = req.body;
        //console.log("The profile data: ", profileData);
        
        await User.updateOwnerProfile(playerId, profileData);
        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Error updating profile", error });
    }
};

// Upload Profile Image
exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        //console.log("The came file is: ",req.file);

        const imageUrl = `${req.file.path}`; // Store relative path
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
        
        const result = await User.getProfileImage(userId);
        
        if (!result) {
            return res.status(404).json({ message: "Profile image not found" });
        }
        
        const imageUrl = result.profileImage;
        //console.log("The image URL: ", imageUrl);
        res.json(imageUrl);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Error fetching profile image", error });
    }
};

// Home Page
exports.getHomePageData = async (req, res) => {
    try {
        const { sport, venue } = req.query;
        const responseData = {};

        // Get arenas (filtered)
        const arenas = await Player.searchArenas(sport, venue);
        responseData.arenas = arenas;

        // Get all sports
        const sports = await Sport.getAllSports();
        responseData.sports = sports;

        // Send the combined response
        res.json(responseData);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: "Database error", error });
    }
};

//player notification 
exports.getPlayerNotifications = async (req, res) => {
    try {
        const playerId = req.user.userId;

        const results = await NotificationModel.getUpcomingSessions(playerId);
        
        if (results.length === 0) {
            return res.status(200).json({ message: "No upcoming notifications", notifications: [] });
        }

        res.status(200).json({ notifications: results });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Error fetching notifications", error });
    }
};