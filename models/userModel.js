const db = require('../config/db');

const User = {
    findByEmail: (email, callback) => {
        db.query('SELECT * FROM users WHERE email = ?', [email], callback);
    },

    createUser: (userData, callback) => {
        db.query(
            'INSERT INTO users (role, firstName, lastName, mobile, country, province, zip, address, email, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            userData,
            callback
        );
    },

    updateUser: (data, callback) => {
        db.query("UPDATE users SET resetToken = ?, resetTokenExpires = ? WHERE email = ?", data, callback);
    },

    // Get all users with valid reset tokens
    getUsersWithValidResetToken: (callback) => {
        const query = "SELECT * FROM users WHERE resetToken IS NOT NULL AND resetTokenExpires > NOW()";
        db.execute(query, [], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    },

    // Update user password and remove reset token
    updateUserPassword: (userId, hashedPassword, callback) => {
        if (!userId || !hashedPassword) {
            console.error("updateUserPassword Error: Missing parameters", { userId, hashedPassword });
            return callback(new Error("User ID or Password is undefined"), null);
        }
    
        const query = "UPDATE users SET password = ?, resetToken = NULL, resetTokenExpires = NULL WHERE userId = ?";
        db.execute(query, [hashedPassword, userId], callback);
    },

    getOwnerProfile: (ownerId, callback) => {
        db.query("SELECT firstName, lastName, email, mobile, country, province, zip, address FROM users WHERE userId = ?", [ownerId], callback);
    },

    updateOwnerProfile: (ownerId, profileData, callback) => {
        const { firstName, lastName, mobile, country, province, zip, address } = profileData;
        db.query(
            "UPDATE users SET firstName = ?, lastName = ?, mobile = ?, country = ?, province = ?, zip = ?, address = ? WHERE userId = ?",
            [firstName, lastName, mobile, country, province, zip, address, ownerId],
            callback
        );
    },

    updateProfileImage: async (userId, imageUrl) => {
        try {
            await db.execute("UPDATE users SET profileImage = ? WHERE userId = ?", [imageUrl, userId]);
            return { message: "Profile image updated successfully" };
        } catch (error) {
            throw error;
        }
    },

    getProfileImage: (userId, callback) => {
        db.query("SELECT profileImage FROM users WHERE userId = ?", [userId], callback);
    },


};

module.exports = User;


