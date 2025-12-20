const prisma = require('../prisma/client');

const loginHistory = {
    // Count logins in past 30 days
    getLoginCountLast30Days: async (userId) => {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const count = await prisma.loginHistory.count({
                where: {
                    userId: parseInt(userId),
                    loginTime: {
                        gte: thirtyDaysAgo
                    }
                }
            });

            return { count };
        } catch (error) {
            console.error('Error getting login count last 30 days:', error);
            throw error;
        }
    },

    // Get last profile update from users table
    getLastProfileUpdate: async (userId) => {
        try {
            const user = await prisma.user.findUnique({
                where: { userId: parseInt(userId) },
                select: { createdAt: true }
            });

            return user ? { created_at: user.createdAt } : null;
        } catch (error) {
            console.error('Error getting last profile update:', error);
            throw error;
        }
    },

    // Group by hour for peak login times
    getLoginByHour: async (userId) => {
        try {
            const logins = await prisma.loginHistory.findMany({
                where: { userId: parseInt(userId) },
                select: { loginTime: true }
            });

            // Group by hour manually since Prisma doesn't have HOUR() function
            const hourCounts = {};
            logins.forEach(login => {
                const hour = login.loginTime.getHours();
                hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            });

            // Convert to array format matching original structure
            const result = Object.entries(hourCounts).map(([hour, count]) => ({
                hour: parseInt(hour),
                count: count
            }));

            return result;
        } catch (error) {
            console.error('Error getting login by hour:', error);
            throw error;
        }
    },

    // Get login dates for streak calculation
    getLoginDates: async (userId) => {
        try {
            const logins = await prisma.loginHistory.findMany({
                where: { userId: parseInt(userId) },
                select: { loginTime: true },
                orderBy: { loginTime: 'desc' }
            });

            // Extract unique dates
            const uniqueDates = [...new Set(
                logins.map(login => login.loginTime.toISOString().split('T')[0])
            )];

            return uniqueDates.map(date => ({ date }));
        } catch (error) {
            console.error('Error getting login dates:', error);
            throw error;
        }
    },

    // Add a login record (use this on successful login)
    addLoginRecord: async (userId) => {
        try {
            const loginRecord = await prisma.loginHistory.create({
                data: {
                    userId: parseInt(userId)
                }
            });
            return loginRecord;
        } catch (error) {
            console.error('Error adding login record:', error);
            throw error;
        }
    }
};

module.exports = loginHistory;