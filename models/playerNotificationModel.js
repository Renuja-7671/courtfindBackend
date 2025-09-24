const prisma = require('../prisma/client');

const NotificationModel = {
    getUpcomingSessions: async (playerId) => {
        try {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000));

            const upcomingSessions = await prisma.booking.findMany({
                where: {
                    playerId: parseInt(playerId),
                    status: 'Booked',
                    OR: [
                        // Tomorrow's bookings
                        {
                            bookingDate: tomorrow
                        },
                        // Today's bookings within next 2 hours
                        {
                            AND: [
                                { bookingDate: today },
                                { startTime: { gte: now } },
                                { startTime: { lte: twoHoursFromNow } }
                            ]
                        }
                    ]
                },
                include: {
                    court: {
                        select: {
                            name: true,
                            arena: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: [
                    { bookingDate: 'asc' },
                    { startTime: 'asc' }
                ]
            });

            // Transform to match original structure
            return upcomingSessions.map(session => ({
                bookingId: session.bookingId,
                booking_date: session.bookingDate,
                start_time: session.startTime,
                end_time: session.endTime,
                courtName: session.court.name,
                arenaName: session.court.arena.name
            }));
        } catch (error) {
            console.error('Error getting upcoming sessions:', error);
            throw error;
        }
    }
};

module.exports = NotificationModel;