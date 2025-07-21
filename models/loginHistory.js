const db = require('../config/db');

const loginHistory = {
    // Count logins in past 30 days
    getLoginCountLast30Days: (userId, callback) => {
        db.query(
            'SELECT COUNT(*) AS count FROM login_history WHERE user_id = ? AND login_time >= NOW() - INTERVAL 30 DAY',
            [userId],
            callback
        );
    },

    //get last profile update from users table
    getLastProfileUpdate: (userId, callback) => {
        db.query(
            `SELECT created_at FROM users WHERE userId = ?`, [userId], callback);
    },

    // Group by hour for peak login times
    getLoginByHour: (userId, callback) => {
        db.query(
            'SELECT HOUR(login_time) AS hour, COUNT(*) AS count FROM login_history WHERE user_id = ? GROUP BY hour',
            [userId],
            callback
        );
    },

    // Get login dates for streak calculation
    getLoginDates: (userId, callback) => {
        db.query(
            'SELECT DATE(login_time) AS date FROM login_history WHERE user_id = ? ORDER BY login_time DESC',
            [userId],
            callback
        );
    },

    // Add a login record (use this on successful login)
    addLoginRecord: (userId, callback) => {
        db.query(
            'INSERT INTO login_history (user_id) VALUES (?)',
            [userId],
            callback
        );
    }
};

module.exports = loginHistory;
