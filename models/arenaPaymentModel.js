const prisma = require('../prisma/client');

const ArenaPayment = {
    getNeededInfoForArenaAddition: async (arenaId) => {
        try {
            const arenaDetails = await prisma.arena.findUnique({
                where: { arenaId: parseInt(arenaId) },
                select: {
                    // All arena fields except images
                    arenaId: true,
                    ownerId: true,
                    name: true,
                    city: true,
                    country: true,
                    description: true,
                    arenaStatus: true,
                    paidStatus: true,
                    declinationReason: true,
                    invoiceUrl: true,
                    amount: true,
                    createdAt: true,
                    // Exclude imageUrl, courts, bookings, payments, reviews, paymentDetails
                    owner: {
                        select: {
                            // All owner fields
                            userId: true,
                            role: true,
                            firstName: true,
                            lastName: true,
                            mobile: true,
                            country: true,
                            province: true,
                            email: true,
                            zip: true,
                            address: true,
                            profileImage: true,
                            createdAt: true
                        }
                    }
                }
            });
            return arenaDetails;
        } catch (error) {
            console.error("Error fetching arena and owner details:", error);
            throw error;
        }
    },

    getArenaPaymentStatus: async (arenaId) => {
        try {
            const arena = await prisma.arena.findUnique({
                where: { arenaId: parseInt(arenaId) },
                select: {
                    paidStatus: true,
                }
            });
            return arena;
        } catch (error) {
            console.error("Error fetching arena payment status:", error);
            throw error;
        }
    },

    updateOwnerPaymentsTable: async (arenaId, ownerId, amount, paymentDesc, payment_method) => {
        try {
            const newPayment = await prisma.payment.create({
                data: {
                    arenaId: parseInt(arenaId),
                    ownerId: parseInt(ownerId),
                    amount: parseFloat(amount),
                    paymentDesc: paymentDesc,
                    payment_method: payment_method,
                    paymentDate: new Date()
                }
            });
            return newPayment;
        } catch (error) {
            console.error("Error updating owner payments table:", error);
            throw error;
        }
    }   
};

module.exports = ArenaPayment;