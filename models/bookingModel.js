const prisma = require('../prisma/client');

const PlayerBooking = {
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
                    },
                    court: {
                        select: {
                            name: true
                        }
                    }
                }
            });

            // Transform to match original structure
            return bookings.map(booking => ({
                name: booking.arena.name,
                courtName: booking.court.name,
                booking_date: booking.bookingDate,
                start_time: booking.startTime,
                end_time: booking.endTime,
                status: booking.status,
                image_url: booking.arena.imageUrl,
                payment_status: booking.paymentStatus
            }));
        } catch (error) {
            console.error('Error getting bookings by player ID:', error);
            throw error;
        }
    },

    setABooking: async (bookingData) => {
        try {
            const { playerId, courtId, booking_date, start_time, end_time, total_price, payment_status, status, ownerId, arenaId } = bookingData;

            const newBooking = await prisma.booking.create({
                data: {
                    playerId: parseInt(playerId),
                    courtId: parseInt(courtId),
                    bookingDate: new Date(booking_date),
                    startTime: start_time,
                    endTime: end_time,
                    totalPrice: parseFloat(total_price),
                    paymentStatus: payment_status,
                    status: status,
                    ownerId: parseInt(ownerId),
                    arenaId: parseInt(arenaId)
                }
            });

            return newBooking;
        } catch (error) {
            console.error('Error setting booking:', error);
            throw error;
        }
    },

    getBookingTimesByCourtId: async (courtId, bookingDate) => {
        try {
            const bookings = await prisma.booking.findMany({
                where: {
                    courtId: parseInt(courtId),
                    bookingDate: new Date(bookingDate),
                    paymentStatus: 'Paid'
                },
                select: {
                    startTime: true,
                    endTime: true
                }
            });

            return bookings.map(booking => ({
                start_time: booking.startTime,
                end_time: booking.endTime
            }));
        } catch (error) {
            console.error('Error getting booking times by court ID:', error);
            throw error;
        }
    },

    getIdOfLastBooking: async (playerId) => {
        try {
            const booking = await prisma.booking.findFirst({
                where: {
                    playerId: parseInt(playerId)
                },
                orderBy: {
                    bookingId: 'desc'
                },
                select: {
                    bookingId: true
                }
            });

            return booking ? booking.bookingId : null;
        } catch (error) {
            console.error('Error getting ID of last booking:', error);
            throw error;
        }
    },

    getBookingDetailsForPayment: async (bookingId) => {
        try {
            const booking = await prisma.booking.findUnique({
                where: {
                    bookingId: parseInt(bookingId)
                },
                include: {
                    arena: {
                        select: {
                            name: true
                        }
                    },
                    court: {
                        select: {
                            name: true
                        }
                    }
                },
                select: {
                    bookingId: true,
                    totalPrice: true,
                    paymentStatus: true,
                    ownerId: true,
                    arena: true,
                    court: true
                }
            });

            if (!booking) {
                return null;
            }

            return {
                bookingId: booking.bookingId,
                total_price: booking.totalPrice,
                payment_status: booking.paymentStatus,
                ownerId: booking.ownerId,
                arena_name: booking.arena.name,
                court_name: booking.court.name
            };
        } catch (error) {
            console.error('Error getting booking details for payment:', error);
            throw error;
        }
    },

    updateInvoiceAndPaymentStatus: async (bookingId, invoiceUrl) => {
        try {
            const updatedBooking = await prisma.booking.update({
                where: {
                    bookingId: parseInt(bookingId)
                },
                data: {
                    paymentStatus: 'Paid',
                    invoicesUrl: invoiceUrl
                }
            });

            return updatedBooking;
        } catch (error) {
            console.error('Error updating invoice and payment status:', error);
            throw error;
        }
    },

    getFullBookingDetails: async (bookingId) => {
        try {
            const booking = await prisma.booking.findUnique({
                where: {
                    bookingId: parseInt(bookingId)
                },
                include: {
                    player: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                    court: {
                        select: {
                            name: true
                        }
                    },
                    arena: {
                        select: {
                            name: true
                        }
                    }
                }
            });

            if (!booking) {
                return null;
            }

            return {
                bookingId: booking.bookingId,
                booking_date: booking.bookingDate,
                start_time: booking.startTime,
                end_time: booking.endTime,
                total_price: booking.totalPrice,
                status: booking.status,
                payment_status: booking.paymentStatus,
                created_at: booking.createdAt,
                firstName: booking.player.firstName,
                lastName: booking.player.lastName,
                email: booking.player.email,
                court_name: booking.court.name,
                arena_name: booking.arena.name
            };
        } catch (error) {
            console.error('Error getting full booking details:', error);
            throw error;
        }
    },

    getOwnerIdForBooking: async (bookingId) => {
        try {
            const booking = await prisma.booking.findUnique({
                where: {
                    bookingId: parseInt(bookingId)
                },
                select: {
                    ownerId: true,
                    arenaId: true
                }
            });

            if (!booking) {
                throw new Error("Booking not found");
            }

            return booking;
        } catch (error) {
            console.error('Error getting owner ID for booking:', error);
            throw error;
        }
    },

    updatePaymentsTable: async (bookingId, paymentDesc, total, payment_method, ownerId, arenaId, playerId) => {
        try {
            const payment = await prisma.payment.create({
                data: {
                    amount: parseFloat(total),
                    paymentMethod: payment_method,
                    bookingId: parseInt(bookingId),
                    arenaId: parseInt(arenaId),
                    ownerId: parseInt(ownerId),
                    playerId: parseInt(playerId),
                    paymentDesc: paymentDesc
                }
            });

            return payment;
        } catch (error) {
            console.error('Error updating payments table:', error);
            throw error;
        }
    }, 

    getNeededInfoForBooking: async (bookingId) => {
        try {
            const booking = await prisma.booking.findUnique({
                where: {
                    bookingId: parseInt(bookingId)
                },
                include: {
                    player: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                            mobile: true,
                            address: true,
                            country: true,
                            province: true
                        }
                    },
                    court: {
                        select: {
                            name: true
                        }
                    },
                    arena: {
                        select: {
                            name: true,
                            city: true
                        }
                    }
                }
            });

            if (!booking) {
                throw new Error("Booking not found");
            }

            return {
                courtName: booking.court?.name || null,
                firstName: booking.player?.firstName || null,
                lastName: booking.player?.lastName || null,
                email: booking.player?.email || null,
                mobile: booking.player?.mobile || null,
                address: booking.player?.address || null,
                city: booking.player?.province || null,
                arenaName: booking.arena?.name || null,
                bookingDate: booking.bookingDate,
                startTime: booking.startTime,
                endTime: booking.endTime
            };
        } catch (error) {
            console.error('Error getting needed info for booking:', error);
            throw error;
        }
    }
};

module.exports = PlayerBooking;