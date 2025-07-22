const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();
const User = require('../models/userModel');

exports.register = async (req, res) => {
     const { role, firstName, lastName, mobile, country, province, zip, address, email, password, ConfirmPassword } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    return res.status(404).json({
            message: 'Unexpected error during registrationtydytdthdtydc',
            data: {
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
                ConfirmPassword,
                hashedPassword
            }
        });

    try { 
       

    if (!role || !firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'Role, first name, last name, email, and password are required' });
    }
    
    try {
        User.findByEmail(email, async (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });

            if (results.length > 0) {
                return res.status(400).json({ message: 'Email already registered' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            User.createUser([role, firstName, lastName, mobile, country, province, zip, address, email, hashedPassword], (err, result) => {
                if (err) return res.status(500).json({ message: 'Error registering user', error: err });

                res.status(201).json({ message: 'User registered successfully' });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
    } catch (error) {
        return res.status(404).json({
            message: 'Unexpected error during registration',
            error: error.message
        });
    }
    
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    User.findByEmail(email, async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (!results || results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = results[0];

        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid email or password" });
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
            console.error("Error comparing passwords:", error);
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    });
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
    const { email } = req.body;

    try {
        // Use the findByEmail method from User model
        User.findByEmail(email, async (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }

            if (results.length === 0) {
                console.log("No user found with this email:", email);
                return res.status(404).json({ message: "User not found" });
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString("hex");
            const hashedToken = bcrypt.hashSync(resetToken, 10);
            const expiryTime = new Date(Date.now() + 3600000); // 1-hour expiration

            // Save token in the database
            User.updateUser([hashedToken, expiryTime, email], async (updateErr) => {
                if (updateErr) {
                    console.error("Error updating reset token:", updateErr);
                    return res.status(500).json({ message: "Error updating reset token", error: updateErr });
                }

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
            });
        });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { password, token } = req.body;
    //console.log("Received Token:", token);
    //console.log("New Password:", password);

    try {
        // Fetch users with valid reset tokens
        User.getUsersWithValidResetToken(async (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }
        
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

            const hashedPassword = bcrypt.hashSync(password, 10);

            // Ensure user.id is defined before updating the password
            if (!user.userId) {
                return res.status(500).json({ message: "Error: User ID is undefined" });
            }

            // Update the password in the database
            User.updateUserPassword(user.userId, hashedPassword, (updateErr) => {
                if (updateErr) {
                    console.error("Error updating password:", updateErr);
                    return res.status(500).json({ message: "Error updating password", error: updateErr });
                }

                res.json({ message: "Password reset successful!" });
            });
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};




