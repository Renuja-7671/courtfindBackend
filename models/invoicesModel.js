const prisma = require('../prisma/client');

const Invoice = {
    getPlayerInvoicesByPlayerId: async (playerId) => {
        try {
            const bookings = await prisma.booking.findMany({
                where: {
                    playerId: parseInt(playerId)
                },
                include: {
                    arena: {
                        select: {
                            name: true,
                            imageUrl: true
                        }
                    }
                },
                orderBy: {
                    bookingDate: 'desc'
                }
            });

            // Transform to match original structure
            return bookings.map(booking => ({
                name: booking.arena.name,
                booking_date: booking.bookingDate,
                start_time: booking.startTime,
                end_time: booking.endTime,
                status: booking.status,
                image_url: booking.arena.imageUrl,
                invoices_url: booking.invoicesUrl
            }));
        } catch (error) {
            console.error('Error getting player invoices by player ID:', error);
            throw error;
        }
    }
};

module.exports = Invoice;