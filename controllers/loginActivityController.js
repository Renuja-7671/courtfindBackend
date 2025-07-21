const loginHistory = require('../models/loginHistory');


exports.getActivitySummary = (req, res) => {
    const userId = req.user.userId;
    if (!userId) {
        return res.status(400).json({ message: "Missing userId in token" });
    }

    // Call both model functions in parallel
    loginHistory.getLoginCountLast30Days(userId, (err1, loginCountResult) => {
        if (err1) {
            console.error("Error fetching login count:", err1);
            return res.status(500).json({ message: "Internal server error fetching login count" });
        }

        loginHistory.getLastProfileUpdate(userId, (err2, lastUpdateResult) => {
            if (err2) {
                console.error("Error fetching last profile update:", err2);
                return res.status(500).json({ message: "Internal server error fetching last profile update" });
            }

            const response = {
                loginCountLast30Days: loginCountResult[0]?.count || 0,
                lastProfileUpdate: lastUpdateResult[0]?.created_at || null,
            };
            
            res.json(response);

        });
    });
};

exports.getLoginTimes = (req, res) => {
    const userId = req.user.userId;
    if (!userId) return res.status(400).json({ message: "Missing userId in token" });

    loginHistory.getLoginByHour(userId, (err, results) => {
        if (err) {
            console.error("Error fetching login by hour:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
        
        res.json({ loginByHour: results });
    });
};

exports.addLoginRecord = async (req, res) => {
    try {
        const userId = req.user.userId;
       
        const rows = await loginHistory.addLoginRecord(userId);
        res.json(rows);
        } catch (error) {
            res.status(500).json({ error: 'Server error' });
    }
};
