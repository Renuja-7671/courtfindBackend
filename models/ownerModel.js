const prisma = require('../prisma/client');

const OwnerDashboard = {
    fetchStats: async (ownerId) => {
        try {
            const totalArenas = await prisma.arena.count({
                where: { ownerId: parseInt(ownerId) }
            });

            const totalBookings = await prisma.booking.count({
                where: { ownerId: parseInt(ownerId) }
            });

            const currentYear = new Date().getFullYear();
            const incomeResult = await prisma.payment.aggregate({
                where: {
                    ownerId: parseInt(ownerId),
                    playerId: { not: null },
                    paidAt: {
                        gte: new Date(`${currentYear}-01-01`),
                        lt: new Date(`${currentYear + 1}-01-01`)
                    }
                },
                _sum: { amount: true }
            });

            const totalIncome = incomeResult._sum.amount || 0;

            return { totalArenas, totalBookings, totalIncome };
        } catch (err) {
            throw err;
        }
    },

    fetchIncomeOverview: async (ownerId, year) => {
        try {
            const payments = await prisma.payment.groupBy({
                by: ['paidAt'],
                where: {
                    ownerId: parseInt(ownerId),
                    playerId: { not: null },
                    paidAt: {
                        gte: new Date(`${year}-01-01`),
                        lt: new Date(`${year + 1}-01-01`)
                    }
                },
                _sum: { amount: true }
            });

            const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const values = Array(12).fill(0);
            
            payments.forEach(payment => {
                const month = payment.paidAt.getMonth();
                values[month] += parseFloat(payment._sum.amount);
            });

            return { labels, values };
        } catch (err) {
            console.error("Error fetching income overview:", err);
            throw err;
        }
    },

    getTotalIncomeForYear: async (ownerId, year) => {
        try {
            const result = await prisma.payment.aggregate({
                where: {
                    ownerId: parseInt(ownerId),
                    playerId: { not: null },
                    paidAt: {
                        gte: new Date(`${year}-01-01`),
                        lt: new Date(`${year + 1}-01-01`)
                    }
                },
                _sum: { amount: true }
            });
            return result._sum.amount || 0;
        } catch (err) {
            throw err;
        }
    },

    fetchRecentBookings: async (ownerId) => {
        try {
            const bookings = await prisma.booking.findMany({
                where: {
                    arena: { ownerId: parseInt(ownerId) }
                },
                include: {
                    arena: { select: { name: true } },
                    court: { select: { name: true } }
                },
                orderBy: { bookingDate: 'desc' }
            });

            return bookings.map(booking => ({
                bookingId: booking.bookingId,
                arenaName: booking.arena.name,
                court: booking.court.name,
                booking_date: booking.bookingDate,
                startTime: booking.startTime,
                end_time: booking.endTime
            }));
        } catch (err) {
            throw err;
        }
    },

    fetchPaymentHistory: async (ownerId) => {
        try {
            const payments = await prisma.payment.findMany({
                where: { ownerId: parseInt(ownerId) },
                orderBy: { paidAt: 'desc' },
                select: {
                    paymentId: true,
                    paymentDesc: true,
                    paidAt: true,
                    amount: true
                }
            });

            return payments.map(payment => ({
                paymentId: payment.paymentId,
                paymentDesc: payment.paymentDesc,
                paid_at: payment.paidAt,
                amount: payment.amount
            }));
        } catch (err) {
            throw err;
        }
    },

    fetchArenaBookings: async (ownerId) => {
        try {
            const bookings = await prisma.booking.findMany({
                where: { ownerId: parseInt(ownerId) },
                include: {
                    court: { select: { name: true } },
                    player: {
                        select: {
                            firstName: true,
                            lastName: true,
                            mobile: true,
                            email: true
                        }
                    }
                },
                orderBy: [
                    { bookingDate: 'desc' },
                    { startTime: 'asc' }
                ]
            });

            return bookings.map(booking => ({
                bookingId: booking.bookingId,
                court_name: booking.court.name,
                booking_date: booking.bookingDate,
                start_time: booking.startTime,
                end_time: booking.endTime,
                total_price: booking.totalPrice,
                payment_status: booking.paymentStatus,
                status: booking.status,
                booked_at: booking.createdAt,
                firstName: booking.player.firstName,
                lastName: booking.player.lastName,
                mobile: booking.player.mobile,
                email: booking.player.email
            }));
        } catch (err) {
            throw err;
        }
    },

    updateCancelStatus: async (bookingId, reason) => {
        try {
            const booking = await prisma.booking.update({
                where: { bookingId: parseInt(bookingId) },
                data: {
                    status: 'Cancelled',
                    cancellationReason: reason
                }
            });
            return booking;
        } catch (err) {
            throw err;
        }
    },

    fetchArenasOfOwner: async (ownerId) => {
        try {
            const arenas = await prisma.arena.findMany({
                where: {
                    ownerId: parseInt(ownerId),
                    paidStatus: 'Paid'
                },
                select: {
                    arenaId: true,
                    name: true
                }
            });
            return arenas;
        } catch (err) {
            throw err;
        }
    },

    fetchSelectedArenaBookings: async (ownerId, arenaId) => {
        try {
            const bookings = await prisma.booking.findMany({
                where: {
                    ownerId: parseInt(ownerId),
                    arenaId: parseInt(arenaId)
                },
                include: {
                    court: { select: { name: true } },
                    player: {
                        select: {
                            firstName: true,
                            lastName: true,
                            mobile: true,
                            email: true
                        }
                    }
                },
                orderBy: [
                    { bookingDate: 'desc' },
                    { startTime: 'asc' }
                ]
            });

            return bookings.map(booking => ({
                bookingId: booking.bookingId,
                court_name: booking.court.name,
                booking_date: booking.bookingDate,
                start_time: booking.startTime,
                end_time: booking.endTime,
                total_price: booking.totalPrice,
                payment_status: booking.paymentStatus,
                status: booking.status,
                booked_at: booking.createdAt,
                firstName: booking.player.firstName,
                lastName: booking.player.lastName,
                mobile: booking.player.mobile,
                email: booking.player.email
            }));
        } catch (err) {
            throw err;
        }
    },

    fetchCourtsByArenaId: async (arenaId) => {
        try {
            const courts = await prisma.court.findMany({
                where: { arenaId: parseInt(arenaId) },
                select: {
                    courtId: true,
                    name: true
                }
            });
            return courts;
        } catch (err) {
            throw err;
        }
    },

    fetchFilteredArenaBookings: async (ownerId, arenaId, courtName) => {
        try {
            const whereClause = {
                ownerId: parseInt(ownerId),
                arenaId: parseInt(arenaId)
            };

            if (courtName) {
                whereClause.court = {
                    name: courtName
                };
            }

            const bookings = await prisma.booking.findMany({
                where: whereClause,
                include: {
                    court: { select: { name: true } },
                    player: {
                        select: {
                            firstName: true,
                            lastName: true,
                            mobile: true,
                            email: true
                        }
                    }
                },
                orderBy: [
                    { bookingDate: 'desc' },
                    { startTime: 'asc' }
                ]
            });

            return bookings.map(booking => ({
                bookingId: booking.bookingId,
                court_name: booking.court.name,
                booking_date: booking.bookingDate,
                start_time: booking.startTime,
                end_time: booking.endTime,
                total_price: booking.totalPrice,
                payment_status: booking.paymentStatus,
                status: booking.status,
                booked_at: booking.createdAt,
                firstName: booking.player.firstName,
                lastName: booking.player.lastName,
                mobile: booking.player.mobile,
                email: booking.player.email
            }));
        } catch (err) {
            throw err;
        }
    },

    // FOR MY PROFIT DASHBOARD
    fetchTotalRevenue: async (ownerId) => {
        try {
            const result = await prisma.payment.aggregate({
                where: {
                    booking: {
                        ownerId: parseInt(ownerId)
                    }
                },
                _sum: { amount: true }
            });
            return result._sum.amount || 0;
        } catch (err) {
            throw err;
        }
    },

    fetchCurrentMonthRevenue: async (ownerId) => {
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const result = await prisma.payment.aggregate({
                where: {
                    booking: {
                        ownerId: parseInt(ownerId)
                    },
                    paidAt: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                },
                _sum: { amount: true }
            });
            return result._sum.amount || 0;
        } catch (err) {
            throw err;
        }
    },

    fetchYearlyChartData: async (ownerId, year = new Date().getFullYear()) => {
        try {
            const payments = await prisma.payment.findMany({
                where: {
                    booking: {
                        ownerId: parseInt(ownerId)
                    },
                    paidAt: {
                        gte: new Date(`${year}-01-01`),
                        lt: new Date(`${year + 1}-01-01`)
                    }
                },
                include: {
                    booking: {
                        include: {
                            arena: {
                                select: { name: true }
                            }
                        }
                    }
                }
            });

            const arenaNames = [...new Set(payments.map(p => p.booking.arena.name))];

            const chartData = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: []
            };

            arenaNames.forEach(arenaName => {
                const arenaData = Array(12).fill(0);
                payments.forEach(payment => {
                    if (payment.booking.arena.name === arenaName) {
                        const month = payment.paidAt.getMonth();
                        arenaData[month] += parseFloat(payment.amount);
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

    fetchMonthlyChartData: async (ownerId, year = new Date().getFullYear(), month = new Date().getMonth() + 1) => {
        try {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            const payments = await prisma.payment.findMany({
                where: {
                    booking: {
                        ownerId: parseInt(ownerId)
                    },
                    paidAt: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                include: {
                    booking: {
                        include: {
                            arena: {
                                select: { name: true }
                            }
                        }
                    }
                }
            });

            const daysInMonth = endDate.getDate();
            const dayLabels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

            const chartData = {
                labels: dayLabels,
                datasets: []
            };

            if (!payments || payments.length === 0) {
                return chartData;
            }

            const arenaNames = [...new Set(payments.map(p => p.booking.arena.name))];

            arenaNames.forEach(arenaName => {
                const arenaData = Array(daysInMonth).fill(0);
                payments.forEach(payment => {
                    if (payment.booking.arena.name === arenaName) {
                        const day = payment.paidAt.getDate();
                        arenaData[day - 1] += parseFloat(payment.amount);
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

    fetchAllTransactions: async (ownerId) => {
        try {
            const transactions = await prisma.payment.findMany({
                where: {
                    booking: {
                        ownerId: parseInt(ownerId)
                    }
                },
                include: {
                    booking: {
                        include: {
                            player: {
                                select: {
                                    firstName: true,
                                    lastName: true
                                }
                            }
                        }
                    }
                },
                orderBy: { paidAt: 'desc' }
            });

            return transactions.map(transaction => ({
                bookingId: transaction.bookingId,
                player_name: `${transaction.booking.player.firstName} ${transaction.booking.player.lastName}`,
                date: transaction.paidAt.toISOString().split('T')[0],
                amount: transaction.amount
            }));
        } catch (err) {
            throw err;
        }
    },

    fetchPaymentHistoryForMyProfit: async (ownerId) => {
        try {
            const payments = await prisma.payment.findMany({
                where: {
                    ownerId: parseInt(ownerId),
                    playerId: null
                },
                orderBy: { paidAt: 'desc' },
                select: {
                    paymentId: true,
                    paymentDesc: true,
                    paidAt: true,
                    amount: true
                }
            });

            return payments.map(payment => ({
                paymentId: payment.paymentId,
                payment_description: payment.paymentDesc,
                date: payment.paidAt.toISOString().split('T')[0],
                amount: payment.amount
            }));
        } catch (err) {
            throw err;
        }
    },

    fetchOwnerArenas: async (ownerId) => {
        try {
            const arenas = await prisma.arena.findMany({
                where: {
                    ownerId: parseInt(ownerId),
                    paidStatus: 'Paid'
                },
                select: {
                    arenaId: true,
                    name: true,
                    city: true,
                    country: true
                },
                orderBy: { name: 'asc' }
            });
            return arenas;
        } catch (err) {
            throw err;
        }
    },

    fetchArenaDetails: async (arenaId) => {
        try {
            const arena = await prisma.arena.findUnique({
                where: { arenaId: parseInt(arenaId) },
                select: {
                    arenaId: true,
                    name: true,
                    city: true,
                    country: true,
                    description: true
                }
            });
            return arena || null;
        } catch (err) {
            throw err;
        }
    },

    fetchArenaCourtYearlyData: async (arenaId, year = new Date().getFullYear()) => {
        try {
            const payments = await prisma.payment.findMany({
                where: {
                    booking: {
                        court: {
                            arenaId: parseInt(arenaId)
                        }
                    },
                    paidAt: {
                        gte: new Date(`${year}-01-01`),
                        lt: new Date(`${year + 1}-01-01`)
                    }
                },
                include: {
                    booking: {
                        include: {
                            court: {
                                select: { name: true }
                            }
                        }
                    }
                }
            });

            const courtNames = [...new Set(payments.map(p => p.booking.court.name))];

            const chartData = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: []
            };

            if (!payments || payments.length === 0) {
                return chartData;
            }

            courtNames.forEach(courtName => {
                const courtData = Array(12).fill(0);
                payments.forEach(payment => {
                    if (payment.booking.court.name === courtName) {
                        const month = payment.paidAt.getMonth();
                        courtData[month] += parseFloat(payment.amount);
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

    fetchTopEarningCourts: async (ownerId) => {
        try {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            const courtRevenue = await prisma.payment.groupBy({
                by: ['bookingId'],
                where: {
                    booking: {
                        ownerId: parseInt(ownerId)
                    },
                    paidAt: {
                        gte: threeMonthsAgo
                    }
                },
                _sum: { amount: true },
                _count: { bookingId: true }
            });

            // Get detailed court and arena info for each booking
            const detailedResults = await Promise.all(
                courtRevenue.map(async (revenue) => {
                    const booking = await prisma.booking.findUnique({
                        where: { bookingId: revenue.bookingId },
                        include: {
                            court: { select: { name: true } },
                            arena: { select: { name: true } }
                        }
                    });
                    
                    return {
                        court_name: booking.court.name,
                        arena_name: booking.arena.name,
                        total_revenue: revenue._sum.amount,
                        booking_count: revenue._count.bookingId,
                        avg_revenue_per_booking: parseFloat((revenue._sum.amount / revenue._count.bookingId).toFixed(2))
                    };
                })
            );

            // Group by court and sum revenues
            const courtGroups = {};
            detailedResults.forEach(result => {
                const key = `${result.court_name}_${result.arena_name}`;
                if (!courtGroups[key]) {
                    courtGroups[key] = {
                        court_name: result.court_name,
                        arena_name: result.arena_name,
                        total_revenue: 0,
                        booking_count: 0
                    };
                }
                courtGroups[key].total_revenue += parseFloat(result.total_revenue);
                courtGroups[key].booking_count += result.booking_count;
            });

            // Convert to array and calculate averages
            const results = Object.values(courtGroups).map(court => ({
                ...court,
                avg_revenue_per_booking: parseFloat((court.total_revenue / court.booking_count).toFixed(2))
            }));

            // Sort by revenue and take top 3
            results.sort((a, b) => b.total_revenue - a.total_revenue);
            return results.slice(0, 3);
        } catch (err) {
            throw err;
        }
    },

    analyzePlayerBehaviorLast3Months: async (ownerId) => {
        try {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            const recentBookings = await prisma.booking.findMany({
                where: {
                    ownerId: parseInt(ownerId),
                    bookingDate: { gte: threeMonthsAgo }
                },
                include: {
                    player: {
                        select: {
                            userId: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    payments: {
                        select: { amount: true }
                    }
                }
            });

            // Group by player and calculate stats
            const playerGroups = {};
            for (const booking of recentBookings) {
                const playerId = booking.player.userId;
                if (!playerGroups[playerId]) {
                    // Check for previous bookings before 3 months ago
                    const previousBookings = await prisma.booking.count({
                        where: {
                            playerId: playerId,
                            ownerId: parseInt(ownerId),
                            bookingDate: { lt: threeMonthsAgo }
                        }
                    });

                    playerGroups[playerId] = {
                        userId: playerId,
                        player_name: `${booking.player.firstName} ${booking.player.lastName}`,
                        booking_count: 0,
                        total_paid: 0,
                        previous_bookings: previousBookings,
                        player_type: previousBookings > 0 ? "Repeat" : "New"
                    };
                }
                
                playerGroups[playerId].booking_count++;
                const paymentAmount = booking.payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
                playerGroups[playerId].total_paid += paymentAmount;
            }

            return Object.values(playerGroups);
        } catch (err) {
            throw err;
        }
    },

    updatePaymentsTableForArenaAdd: async (arenaId, total, ownerId, paymentDesc, payment_method) => {
        try {
            await prisma.payment.create({
                data: {
                    arenaId: parseInt(arenaId),
                    amount: parseFloat(total),
                    ownerId: parseInt(ownerId),
                    paymentDesc: paymentDesc,
                    paymentMethod: payment_method
                }
            });
            return { message: "Payment record updated successfully" };
        } catch (err) {
            throw err;
        }
    },

    fetchArenaRevenueDistribution: async (ownerId, year) => {
        try {
            const revenues = await prisma.payment.groupBy({
                by: ['arenaId'],
                where: {
                    ownerId: parseInt(ownerId),
                    playerId: { not: null },
                    paidAt: {
                        gte: new Date(`${year}-01-01`),
                        lt: new Date(`${year + 1}-01-01`)
                    }
                },
                _sum: { amount: true }
            });

            const results = await Promise.all(
                revenues.map(async (revenue) => {
                    const arena = await prisma.arena.findUnique({
                        where: { arenaId: revenue.arenaId },
                        select: { name: true }
                    });
                    
                    return {
                        name: arena.name,
                        total: revenue._sum.amount
                    };
                })
            );

            return results;
        } catch (err) {
            throw err;
        }
    }
};

module.exports = OwnerDashboard;