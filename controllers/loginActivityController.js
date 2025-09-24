const loginHistory = require('../models/loginHistory');

exports.getActivitySummary = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(400).json({ message: "Missing userId in token" });
        }

        // Call both model functions in parallel using Promise.all
        const [loginCountResult, lastUpdateResult] = await Promise.all([
            loginHistory.getLoginCountLast30Days(userId),
            loginHistory.getLastProfileUpdate(userId)
        ]);

        const response = {
            loginCountLast30Days: loginCountResult?.count || 0,
            lastProfileUpdate: lastUpdateResult?.created_at || null,
        };
        
        res.json(response);

    } catch (error) {
        console.error("Error fetching activity summary:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getLoginTimes = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(400).json({ message: "Missing userId in token" });
        }

        const results = await loginHistory.getLoginByHour(userId);
        res.json({ loginByHour: results });

    } catch (error) {
        console.error("Error fetching login by hour:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.addLoginRecord = async (req, res) => {
    try {
        const userId = req.user.userId;
       
        const rows = await loginHistory.addLoginRecord(userId);
        res.json(rows);
    } catch (error) {
        console.error("Error adding login record:", error);
        res.status(500).json({ error: 'Server error' });
    }
};