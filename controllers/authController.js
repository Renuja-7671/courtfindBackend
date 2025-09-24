const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();
const User = require('../models/userModel');

exports.register = async (req, res) => {
    try {
        const {
            role,
            firstName,
            lastName,
            mobile,
            country,
            province,
            zip,
            address,
            email,
            password,
            ConfirmPassword
        } = req.body;

        if (!role || !firstName || !lastName || !email || !password) {
            return res.status(400).json({
                message: 'Role, first name, last name, email, and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(email);

        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user
        await User.createUser([
            role,
            firstName,
            lastName,
            mobile,
            country,
            province,
            zip,
            address,
            email,
            hashedPassword
        ]);

        return res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({
            message: 'Unexpected error during registration',
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findByEmail(email);
        
        if (!user) {
            return res.status(401).json({ message: "Invalid email" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate JWT with user ID and role
        const token = jwt.sign(
            { userId: user.userId, role: user.role }, // Include role for authorization
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ 
            message: "Login successful", 
            token, 
            user: { id: user.userId, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findByEmail(email);
        
        if (!user) {
            console.log("No user found with this email:", email);
            return res.status(404).json({ message: "User not found" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = bcrypt.hashSync(resetToken, 10);
        const expiryTime = new Date(Date.now() + 3600000); // 1-hour expiration

        // Save token in the database
        await User.updateUser([hashedToken, expiryTime, email]);

        // Send reset email
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        const mailOptions = {
            to: email,
            from: process.env.EMAIL_USER,
            subject: "Password Reset Request",
            html: `<p>You requested a password reset. Click the link below to reset your password:</p>
                   <a href="${resetUrl}">${resetUrl}</a>
                   <p>This link expires in 1 hour.</p>`
        };

        try {
            await transporter.sendMail(mailOptions);
            // console.log("Reset email sent to:", email);
            res.json({ message: "Password reset link sent to your email" });
        } catch (emailError) {
            console.error("Error sending email:", emailError);
            res.status(500).json({ message: "Error sending email", error: emailError.message });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { password, token } = req.body;
        //console.log("Received Token:", token);
        //console.log("New Password:", password);

        // Fetch users with valid reset tokens
        const results = await User.getUsersWithValidResetToken();
        
        //console.log("Database results:", results);
        
        if (!results || results.length === 0) {
            console.log("No user found with valid reset token.");
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Find the user with the matching reset token
        const user = results.find(u => u.resetToken && bcrypt.compareSync(token, u.resetToken));
        
        if (!user) {
            console.log("No matching user found for this token.");
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the password in the database
        await User.updateUserPassword(user.userId, hashedPassword);

        res.json({ message: "Password reset successful!" });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};