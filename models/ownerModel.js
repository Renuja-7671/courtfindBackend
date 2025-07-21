const db = require('../config/db');

const OwnerDashboard = {
    fetchStats: async (ownerId) => {
        try {
            const [arenaRes] = await query('SELECT COUNT(*) AS totalArenas FROM arenas WHERE owner_id = ?', [ownerId]);
            const totalArenas = arenaRes[0].totalArenas;

            const [bookingRes] = await query('SELECT COUNT(*) AS totalBookings FROM bookings WHERE ownerId = ?', [ownerId]);
            const totalBookings = bookingRes[0].totalBookings;

            const [incomeRes] = await query('SELECT SUM(amount) AS totalIncome FROM payments WHERE ownerId = ? AND playerId IS NOT NULL  AND YEAR(paid_at) = YEAR(CURDATE());', [ownerId]);
            const totalIncome = incomeRes[0].totalIncome || 0;

            return { totalArenas, totalBookings, totalIncome };
        } catch (err) {
            throw err;
        }
    },

    fetchIncomeOverview: async (ownerId, year) => {
        try {
            const queryStr = `
                SELECT MONTH(paid_at) AS month, SUM(amount) AS total
                FROM payments
                WHERE ownerId = ? AND YEAR(paid_at) = ? AND playerId IS NOT NULL
                GROUP BY MONTH(paid_at)
                ORDER BY MONTH(paid_at)
            `;
            const [rows] = await query(queryStr, [ownerId, year]);

            const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const values = Array(12).fill(0);
            rows.forEach(row => {
                values[row.month - 1] = parseFloat(row.total);
            });

            return { labels, values };
        } catch (err) {
            console.error("Error fetching income overview:", err);
            throw err;
        }
    }, 

    getTotalIncomeForYear: async (ownerId, year) => {
    const queryStr = `
        SELECT SUM(amount) AS total_income
        FROM payments
        WHERE ownerId = ? 
        AND YEAR(paid_at) = ? 
        AND playerId IS NOT NULL
    `;
    const [rows] = await query(queryStr, [ownerId, year]);
    return rows[0].total_income || 0;
    },

    fetchRecentBookings: async (ownerId) => {
        try {
            const queryStr = `
                SELECT b.bookingId AS bookingId, a.name AS arenaName, c.name AS court, b.booking_date, b.start_time AS startTime, b.end_time
                FROM bookings b 
                JOIN arenas a ON b.arenaId = a.arenaId 
                JOIN courts c ON b.courtId = c.courtId
                WHERE a.owner_id = ?
                ORDER BY b.booking_date DESC
            `;
            const [rows] = await query(queryStr, [ownerId]);
            return rows;
        } catch (err) {
            throw err;
        }
    },

    fetchPaymentHistory: async (ownerId) => {
        try {
            const queryStr = `
                SELECT paymentId, paymentDesc, paid_at, amount
                FROM payments
                WHERE ownerId = ?
                ORDER BY paid_at DESC
            `;
            const [rows] = await query(queryStr, [ownerId]);
            return rows;
        } catch (err) {
            throw err;
        }
    },

    fetchArenaBookings: async (ownerId) =>{
        try {
            const queryStr = `SELECT b.bookingId, c.name AS court_name, b.booking_date, b.start_time, b.end_time, b.total_price, b.payment_status, b.status, b.created_at AS booked_at, u.firstName, u.lastName, u.mobile, u.email
                              FROM courts c, bookings b, users u
                              WHERE c.courtId = b.courtId AND b.playerId = u.userId AND b.ownerId = ?
                              ORDER BY b.booking_date DESC, b.start_time ASC`;

           const[rows] = await query(queryStr,[ownerId]) ;
           return rows;      
        } catch (err) {
            throw err;
    }
},

    updateCancelStatus : async (bookingId, reason) => {
        try {
            const queryStr = `UPDATE bookings SET status = 'Cancelled', cancellationReason = ? WHERE bookingId =?`;
            const [rows] = await query(queryStr, [reason, bookingId]);
            return rows;
        } catch (err) {
            throw err;
    }
}, 

fetchArenasOfOwner : async (ownerId) => {
    try {
        const queryStr = `SELECT arenaId, name FROM arenas WHERE owner_id = ? AND paidStatus = 'Paid'`;
        const [rows] = await query(queryStr, [ownerId]) ;
        return rows ;
        } catch (err) {
            throw err ;
            }
},
      

 fetchSelectedArenaBookings: async (ownerId, arenaId) =>{
        try {
            const queryStr = `SELECT b.bookingId, c.name AS court_name, b.booking_date, b.start_time, b.end_time, b.total_price, b.payment_status, b.status, b.created_at AS booked_at, u.firstName, u.lastName, u.mobile, u.email
                              FROM courts c, bookings b, users u
                              WHERE c.courtId = b.courtId AND b.playerId = u.userId AND b.ownerId = ? AND b.arenaId = ?
                              ORDER BY b.booking_date DESC, b.start_time ASC`;

           const[rows] = await query(queryStr,[ownerId, arenaId]) ;
           return rows;      
        } catch (err) {
            throw err;
    }
},

fetchCourtsByArenaId: async (arenaId) => {
    try {
        const queryStr = `SELECT courtId, name FROM courts WHERE arenaId = ?`;
        const [rows] = await query(queryStr, [arenaId]) ;
        return rows ;
        } catch (err) {
            throw err ;
            }
},

fetchFilteredArenaBookings: async (ownerId, arenaId, courtName) => {
    console.log("Fetching filtered arena bookings with parameters:", { ownerId, arenaId, courtName });
    try {
        let queryStr = `
            SELECT b.bookingId, c.name AS court_name, b.booking_date, b.start_time, b.end_time,
                   b.total_price, b.payment_status, b.status, b.created_at AS booked_at,
                   u.firstName, u.lastName, u.mobile, u.email
            FROM courts c, bookings b, users u
            WHERE c.courtId = b.courtId 
              AND b.playerId = u.userId 
              AND b.ownerId = ? 
              AND b.arenaId = ?
        `;

        const params = [ownerId, arenaId];

        if (courtName) {
            queryStr += ` AND c.name = ?`;
            params.push(courtName);
        }

        queryStr += ` ORDER BY b.booking_date DESC, b.start_time ASC`;

        const [rows] = await query(queryStr, params);
        return rows;
    } catch (err) {
        throw err;
    }
},

// FOR MY PROFIT DASHBOARD

    // 1. Total Revenue Function
    fetchTotalRevenue: async (ownerId) => {
        try {
            const queryStr = `
                SELECT SUM(p.amount) AS total_revenue
                FROM payments p
                JOIN bookings b ON p.bookingId = b.bookingId
                WHERE b.ownerId = ?
            `;
            const [rows] = await query(queryStr, [ownerId]);
            return rows[0].total_revenue || 0;
        } catch (err) {
            throw err;
        }
    },

    // Revenue for current month
    fetchCurrentMonthRevenue: async (ownerId) => {
        try {
            const queryStr = `
                SELECT SUM(p.amount) AS current_month_revenue
                FROM payments p
                JOIN bookings b ON p.bookingId = b.bookingId
                WHERE b.ownerId = ?
                AND MONTH(p.paid_at) = MONTH(CURRENT_DATE())
                AND YEAR(p.paid_at) = YEAR(CURRENT_DATE())
            `;
            const [rows] = await query(queryStr, [ownerId]);
            return rows[0].current_month_revenue || 0;
        } catch (err) {
            throw err;
        }
    },

    //2. Yearly Chart Data Function
    fetchYearlyChartData: async (ownerId, year = new Date().getFullYear()) => {
        try {
            const queryStr = `
                SELECT 
                    a.name AS arena_name,
                    MONTH(p.paid_at) AS month,
                    SUM(p.amount) AS total
                FROM payments p
                JOIN bookings b ON p.bookingId = b.bookingId
                JOIN arenas a ON b.arenaId = a.arenaId
                WHERE b.ownerId = ? AND YEAR(p.paid_at) = ?
                GROUP BY a.arenaId, a.name, MONTH(p.paid_at)
                ORDER BY a.name, MONTH(p.paid_at)
            `;
            const [rows] = await query(queryStr, [ownerId, year]);

            const arenaNames = [...new Set(rows.map(row => row.arena_name))];

            const chartData = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: []
            };

            arenaNames.forEach(arenaName => {
                const arenaData = Array(12).fill(0);
                rows.forEach(row => {
                    if (row.arena_name === arenaName) {
                        arenaData[row.month - 1] = row.total;
                    }
                });

                chartData.datasets.push({
                    label: arenaName,
                    data: arenaData
                });
            });

            return chartData;
        } catch (err) {
            throw err;
        }
    },


    // 3. Monthly Chart Data Function
// Updated fetchMonthlyChartData function in ownerModel.js
fetchMonthlyChartData: async (ownerId, year = new Date().getFullYear(), month = new Date().getMonth() + 1) => {
    try {
        const queryStr = `
        SELECT 
            a.name AS arena_name,
            DAY(p.paid_at) AS day,
            SUM(p.amount) AS total
        FROM payments p
        JOIN bookings b ON p.bookingId = b.bookingId
        JOIN arenas a ON b.arenaId = a.arenaId
        WHERE b.ownerId = ? AND YEAR(p.paid_at) = ? AND MONTH(p.paid_at) = ? 
        GROUP BY a.arenaId, a.name, DAY(p.paid_at)
        ORDER BY a.name, DAY(p.paid_at)
        `;
        const [rows] = await query(queryStr, [ownerId, year, month]);
        console.log("Getting data for:", ownerId, year, month);
        console.log("Query results:", rows); // Debug log
        
        // Clear previous state by resetting chartData on every call
        
        const daysInMonth = new Date(year, month, 0).getDate();
        const dayLabels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

        // Initialize empty chart data
        const chartData = {
            labels: dayLabels,
            datasets: []
        };

        // If no data found, return empty chart
        if (!rows || rows.length === 0) {
            console.log("No data found for the selected month");
            return chartData;
        }

        const arenaNames = [...new Set(rows.map(row => row.arena_name))];

        arenaNames.forEach(arenaName => {
            const arenaData = Array(daysInMonth).fill(0);
            rows.forEach(row => {
                if (row.arena_name === arenaName) {
                    arenaData[row.day - 1] = row.total;
                }
            });

            chartData.datasets.push({
                label: arenaName,
                data: arenaData
            });
        });

        return chartData;
    } catch (err) {
        throw err;
    }
},
/*
    fetchMonthlyChartData: async (ownerId, year = new Date().getFullYear(), month = new Date().getMonth() + 1) => {
        try {
            const queryStr = `
                SELECT 
                    a.name AS arena_name,
                    DAY(p.paid_at) AS day,
                    SUM(p.amount) AS total
                FROM payments p
                JOIN bookings b ON p.bookingId = b.bookingId
                JOIN arenas a ON b.arenaId = a.arenaId
                WHERE b.ownerId = ? AND YEAR(p.paid_at) = ?
                GROUP BY a.arenaId, a.name, DAY(p.paid_at)
                ORDER BY a.name, DAY(p.paid_at)
            `;
            const [rows] = await query(queryStr, [ownerId, year]);

            // Get unique arena names
            const arenaNames = [...new Set(rows.map(row => row.arena_name))];
            
            // Get days in the specified year (assuming current month or you can add month parameter)
            const daysInMonth = new Date(year, new Date().getMonth() + 1, 0).getDate();
            const dayLabels = Array.from({length: daysInMonth}, (_, i) => (i + 1).toString());
            
            // Prepare data structure
            const chartData = {
                labels: dayLabels,
                datasets: []
            };

            // Create dataset for each arena
            arenaNames.forEach(arenaName => {
                const arenaData = Array(daysInMonth).fill(0);
                rows.forEach(row => {
                    if (row.arena_name === arenaName) {
                        arenaData[row.day - 1] = row.total;
                    }
                });
                
                chartData.datasets.push({
                    label: arenaName,
                    data: arenaData
                });
            });

            return chartData;
        } catch (err) {
            throw err;
        }
    },
*/
    // 4. All Transactions Function
    fetchAllTransactions: async (ownerId) => {
        try {
            const queryStr = `
                SELECT 
                    b.bookingId,
                    CONCAT(u.firstName, ' ', u.lastName) AS player_name,
                    DATE(p.paid_at) AS date,
                    p.amount
                FROM payments p
                JOIN bookings b ON p.bookingId = b.bookingId
                JOIN users u ON b.playerId = u.userId
                WHERE b.ownerId = ?
                ORDER BY p.paid_at DESC
            `;
            const [rows] = await query(queryStr, [ownerId]);
            return rows;
        } catch (err) {
            throw err;
        }
    },

    // 5. Payment History for Profit Dashboard
    fetchPaymentHistoryForMyProfit: async (ownerId) => {
        try {
            const queryStr = `
                SELECT p.paymentId, p.paymentDesc AS payment_description, DATE(p.paid_at) AS date, p.amount
                FROM payments p
                WHERE p.ownerId = ? AND p.playerId IS NULL
                ORDER BY p.paid_at DESC;
            `;
            const [rows] = await query(queryStr, [ownerId]);
            return rows;
        } catch (err) {
            throw err;
        }
    },


    //For courtwise Profit Page
    // Get all arenas for a specific owner
    fetchOwnerArenas: async (ownerId) => {
        try {
            const queryStr = `
                SELECT arenaId, name, city, country 
                FROM arenas 
                WHERE owner_id = ? AND paidStatus = 'Paid'
                ORDER BY name ASC
            `;
            const [rows] = await query(queryStr, [ownerId]);
            return rows;
        } catch (err) {
            throw err;
        }
    },

    // Get arena details by ID
    fetchArenaDetails: async (arenaId) => {
        try {
            const queryStr = `
                SELECT arenaId, name, city, country, description
                FROM arenas 
                WHERE arenaId = ?
            `;
            const [rows] = await query(queryStr, [arenaId]);
            return rows[0] || null;
        } catch (err) {
            throw err;
        }
    },

    // Get yearly chart data by courts for a specific arena
    fetchArenaCourtYearlyData: async (arenaId, year = new Date().getFullYear()) => {
        try {
            const queryStr = `
                SELECT 
                    c.name AS court_name,
                    MONTH(p.paid_at) AS month,
                    SUM(p.amount) AS total
                FROM payments p
                JOIN bookings b ON p.bookingId = b.bookingId
                JOIN courts c ON b.courtId = c.courtId
                WHERE c.arenaId = ? AND YEAR(p.paid_at) = ?
                GROUP BY c.courtId, c.name, MONTH(p.paid_at)
                ORDER BY c.name, MONTH(p.paid_at)
            `;
            const [rows] = await query(queryStr, [arenaId, year]);

            // Get unique court names
            const courtNames = [...new Set(rows.map(row => row.court_name))];

            const chartData = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: []
            };

            // If no data, return empty chart
            if (!rows || rows.length === 0) {
                return chartData;
            }

            // Create dataset for each court
            courtNames.forEach(courtName => {
                const courtData = Array(12).fill(0);
                rows.forEach(row => {
                    if (row.court_name === courtName) {
                        courtData[row.month - 1] = row.total;
                    }
                });

                chartData.datasets.push({
                    label: courtName,
                    data: courtData
                });
            });

            return chartData;
        } catch (err) {
            throw err;
        }
    },

    // Courtwise Profit page's new changes
    // Get Top 3 Highest-Earning Courts in Last 3 Months
    fetchTopEarningCourts: async (ownerId) => {
        try {
            const queryStr = `
                SELECT 
                    c.name AS court_name,
                    a.name AS arena_name,
                    SUM(p.amount) AS total_revenue,
                    COUNT(b.bookingId) AS booking_count,
                    ROUND(SUM(p.amount) / COUNT(b.bookingId), 2) AS avg_revenue_per_booking
                FROM bookings b
                JOIN payments p ON b.bookingId = p.bookingId
                JOIN courts c ON b.courtId = c.courtId
                JOIN arenas a ON c.arenaId = a.arenaId
                WHERE b.ownerId = ?
                AND p.paid_at >= CURDATE() - INTERVAL 3 MONTH
                GROUP BY c.courtId
                ORDER BY total_revenue DESC
                LIMIT 3
            `;
            const [rows] = await query(queryStr, [ownerId]);
            return rows;
        } catch (err) {
            throw err;
        }
    },

    // Analyze Player Behavior (Repeat vs New) in Last 3 Months
    analyzePlayerBehaviorLast3Months: async (ownerId) => {
        try {
            const queryStr = `
                SELECT 
                    u.userId,
                    CONCAT(u.firstName, ' ', u.lastName) AS player_name,
                    COUNT(b.bookingId) AS booking_count,
                    SUM(p.amount) AS total_paid,
                    (
                        SELECT COUNT(*) 
                        FROM bookings b2
                        WHERE b2.playerId = b.playerId
                        AND b2.booking_date < CURDATE() - INTERVAL 3 MONTH
                        AND b2.ownerId = ?
                    ) AS previous_bookings
                FROM bookings b
                JOIN users u ON b.playerId = u.userId
                JOIN payments p ON p.bookingId = b.bookingId
                WHERE b.ownerId = ?
                AND b.booking_date >= CURDATE() - INTERVAL 3 MONTH
                GROUP BY u.userId, u.firstName, u.lastName
            `;
            const [rows] = await query(queryStr, [ownerId, ownerId]);

            // Add player type flag to each record
            const result = rows.map(row => ({
                ...row,
                player_type: row.previous_bookings > 0 ? "Repeat" : "New"
            }));

            return result;
        } catch (err) {
            throw err;
        }
    },

    updatePaymentsTableForArenaAdd: async (arenaId, total, ownerId, paymentDesc, payment_method) => {
        try {
            const queryStr = `
                INSERT INTO payments (arenaId, amount, ownerId, paymentDesc, payment_method)
                VALUES (?, ?, ?, ?, ?)
            `;
            await query(queryStr, [arenaId, total, ownerId, paymentDesc, payment_method]);
            return { message: "Payment record updated successfully" };
        } catch (err) {
            throw err;
        }
    },

    fetchArenaRevenueDistribution: async (ownerId, year) => {
        
            const sql = `
                        SELECT a.name, SUM(p.amount) AS total
                        FROM payments p
                        JOIN arenas a ON p.arenaId = a.arenaId
                        WHERE p.ownerId = ? 
                        AND p.playerId IS NOT NULL
                        AND YEAR(p.paid_at) = ?
                        GROUP BY a.name
                    `;
            const [results] = await query(sql, [ownerId, year]);
            return results;
        

    },
}




// Helper: Wrap db.query in a Promise
function query(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve([results]);
        });
    });
}

module.exports = OwnerDashboard;
