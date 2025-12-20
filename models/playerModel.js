const prisma = require('../prisma/client');

const Player = {
    getBookingsByPlayerId: async (playerId) => {
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
                }
            });

            // Transform to match original structure
            return bookings.map(booking => ({
                name: booking.arena.name,
                booking_date: booking.bookingDate,
                start_time: booking.startTime,
                end_time: booking.endTime,
                status: booking.status,
                image_url: booking.arena.imageUrl
            }));
        } catch (error) {
            console.error('Error getting bookings by player ID:', error);
            throw error;
        }
    },

    getArenaCourtDetails: async () => {
        try {
            const courtDetails = await prisma.court.findMany({
                include: {
                    arena: {
                        select: {
                            name: true,
                            country: true,
                            owner: {
                                select: {
                                    address: true
                                }
                            }
                        }
                    }
                }
            });

            // Transform to match original structure
            return courtDetails.map(court => ({
                arena_name: court.arena.name,
                court_name: court.name,
                court_availability: court.availability,
                court_images: court.images,
                arena_address: court.arena.owner.address,
                arena_country: court.arena.country,
                court_opening_hours: court.availability
            }));
        } catch (error) {
            console.error('Error getting arena court details:', error);
            throw error;
        }
    }
};

module.exports = Player;