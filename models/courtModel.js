const prisma = require('../prisma/client');

const court = {
    create: async (courtData) => {
        try {
            const {
                name,
                size,
                rate,
                sport,
                images,
                availability,
                arenaId,
            } = courtData;

            const newCourt = await prisma.court.create({
                data: {
                    name: name,
                    size: parseInt(size),
                    hourlyRate: parseFloat(rate),
                    sport: sport,
                    images: JSON.stringify(images),
                    availability: JSON.stringify(availability),
                    arenaId: parseInt(arenaId)
                }
            });

            return newCourt;
        } catch (error) {
            console.error('Error creating court:', error);
            throw error;
        }
    },

    getCourtsforbooking: async (courtId) => {
        try {
            const courtData = await prisma.court.findUnique({
                where: {
                    courtId: parseInt(courtId)
                },
                include: {
                    arena: {
                        include: {
                            owner: {
                                select: {
                                    mobile: true
                                }
                            }
                        }
                    }
                }
            });

            if (!courtData) {
                return null;
            }

            // Transform to match original structure
            return {
                owner_id: courtData.arena.ownerId,
                mobile: courtData.arena.owner.mobile,
                arenaId: courtData.arena.arenaId,
                arenaName: courtData.arena.name,
                city: courtData.arena.city,
                country: courtData.arena.country,
                description: courtData.arena.description,
                courtId: courtData.courtId,
                courtName: courtData.name,
                size: courtData.size,
                hourly_rate: courtData.hourlyRate,
                sport: courtData.sport,
                images: courtData.images,
                availability: courtData.availability
            };
        } catch (error) {
            console.error('Error getting court for booking:', error);
            throw error;
        }
    },

    // Get courts by arena (only needed fields)
    getCourtsByArena: async (arenaId) => {
        try {
            const courts = await prisma.court.findMany({
                where: {
                    arenaId: parseInt(arenaId)
                },
                select: {
                    courtId: true,
                    name: true
                }
            });

            return courts;
        } catch (error) {
            console.error('Error getting courts by arena:', error);
            throw error;
        }
    },

    // Update court name
    updateCourtName: async (courtId, name) => {
        try {
            const updatedCourt = await prisma.court.update({
                where: {
                    courtId: parseInt(courtId)
                },
                data: {
                    name: name
                }
            });

            return updatedCourt;
        } catch (error) {
            console.error('Error updating court name:', error);
            throw error;
        }
    },

    // Delete court
    deleteCourt: async (courtId) => {
        try {
            const deletedCourt = await prisma.court.delete({
                where: {
                    courtId: parseInt(courtId)
                }
            });

            return true;
        } catch (error) {
            if (error.code === 'P2025') {
                return false; // Court not found
            }
            console.error('Error deleting court:', error);
            throw error;
        }
    }
};

module.exports = court;