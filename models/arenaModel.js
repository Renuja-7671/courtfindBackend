const prisma = require('../prisma/client');

const arena = {
    getAllArenas: async () => {
        try {
            const arenas = await prisma.arena.findMany({
                where: {
                    paidStatus: 'Paid'
                },
                include: {
                    courts: {
                        select: {
                            name: true,
                            courtId: true,
                            sport: true
                        }
                    }
                }
            });
            console.log("The arenas fetched are:", arenas);

            // Transform to match original flat structure
            const result = [];
            arenas.forEach(arena => {
                arena.courts.forEach(court => {
                    result.push({
                        arenaId: arena.arenaId,
                        arenaName: arena.name,
                        city: arena.city,
                        country: arena.country,
                        description: arena.description,
                        image_url: arena.imageUrl,
                        courtName: court.name,
                        courtId: court.courtId,
                        sport: court.sport
                    });
                });
            });

            return result;
        } catch (error) {
            console.error('Error getting all arenas:', error);
            throw error;
        }
    },

    searchArenas: async (sport, venue) => {
        try {
            const whereClause = {
                paidStatus: 'Paid'
            };

            if (sport) {
                whereClause.courts = {
                    some: {
                        sport: {
                            contains: sport
                        }
                    }
                };
            }

            if (venue) {
                whereClause.OR = [
                    {
                        name: {
                            contains: venue,
                        }
                    },
                    {
                        city: {
                            contains: venue,
                        }
                    }
                ];
            }

            const arenas = await prisma.arena.findMany({
                where: whereClause,
                include: {
                    courts: {
                        select: {
                            name: true,
                            courtId: true,
                            sport: true
                        }
                    }
                }
            });

            // Transform to match original flat structure
            const result = [];
            arenas.forEach(arena => {
                arena.courts.forEach(court => {
                    result.push({
                        arenaId: arena.arenaId,
                        arenaName: arena.name,
                        city: arena.city,
                        country: arena.country,
                        description: arena.description,
                        image_url: arena.imageUrl,
                        courtName: court.name,
                        courtId: court.courtId,
                        sport: court.sport
                    });
                });
            });

            return result;
        } catch (error) {
            console.error('Error searching arenas:', error);
            throw error;
        }
    },

    addArena: async (ownerId, name, city, description, image_url) => {
        try {
            const newArena = await prisma.arena.create({
                data: {
                    ownerId: parseInt(ownerId),
                    name: name,
                    city: city,
                    description: description,
                    imageUrl: image_url
                }
            });

            return newArena;
        } catch (error) {
            console.error('Error adding arena:', error);
            throw error;
        }
    },

    getArenaByRating: async () => {
        try {
            const arenas = await prisma.arena.findMany({
                include: {
                    reviews: {
                        select: {
                            rating: true
                        }
                    }
                }
            });

            // Calculate average rating for each arena
            const result = arenas.map(arena => {
                const ratings = arena.reviews.map(review => review.rating);
                const averageRating = ratings.length > 0
                    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
                    : null;

                return {
                    arenaId: arena.arenaId,
                    city: arena.city,
                    name: arena.name,
                    country: arena.country,
                    description: arena.description,
                    image_url: arena.imageUrl,
                    average_rating: averageRating ? parseFloat(averageRating.toFixed(2)) : null
                };
            }).filter(arena => arena.average_rating !== null)
              .sort((a, b) => b.average_rating - a.average_rating);

            return result;
        } catch (error) {
            console.error('Error getting arena by rating:', error);
            throw error;
        }
    },

    getArenasByOwner: async (ownerId) => {
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
        } catch (error) {
            console.error('Error getting arenas by owner:', error);
            throw error;
        }
    },

    updateArenaName: async (arenaId, name) => {
        try {
            const updatedArena = await prisma.arena.update({
                where: {
                    arenaId: parseInt(arenaId)
                },
                data: {
                    name: name
                }
            });

            return updatedArena;
        } catch (error) {
            console.error('Error updating arena name:', error);
            throw error;
        }
    },

    removeArena: async (arenaId) => {
        try {
            const deletedArena = await prisma.arena.delete({
                where: {
                    arenaId: parseInt(arenaId)
                }
            });

            return true;
        } catch (error) {
            if (error.code === 'P2025') {
                return false; // Arena not found
            }
            console.error('Error removing arena:', error);
            throw error;
        }
    },

    getPendingArenas: async (userId) => {
        try {
            const arenas = await prisma.arena.findMany({
                where: {
                    ownerId: parseInt(userId),
                    arenaStatus: 'Pending'
                },
                include: {
                    owner: {
                        select: {
                            firstName: true,
                            lastName: true,
                            mobile: true,
                            province: true,
                            email: true
                        }
                    }
                }
            });

            // Transform to match original structure
            return arenas.map(arena => ({
                arenaId: arena.arenaId,
                arenaName: arena.name,
                city: arena.city,
                country: arena.country,
                description: arena.description,
                image_url: arena.imageUrl,
                firstName: arena.owner.firstName,
                lastName: arena.owner.lastName,
                mobile: arena.owner.mobile,
                province: arena.owner.province,
                email: arena.owner.email
            }));
        } catch (error) {
            console.error('Error getting pending arenas:', error);
            throw error;
        }
    },

    getPendingArenasForAdmin: async () => {
        try {
            const arenas = await prisma.arena.findMany({
                where: {
                    arenaStatus: 'Pending'
                },
                include: {
                    owner: {
                        select: {
                            firstName: true,
                            lastName: true,
                            mobile: true,
                            province: true,
                            email: true
                        }
                    }
                }
            });

            // Transform to match original structure
            return arenas.map(arena => ({
                arenaId: arena.arenaId,
                arenaName: arena.name,
                city: arena.city,
                country: arena.country,
                description: arena.description,
                image_url: arena.imageUrl,
                firstName: arena.owner.firstName,
                lastName: arena.owner.lastName,
                mobile: arena.owner.mobile,
                province: arena.owner.province,
                email: arena.owner.email
            }));
        } catch (error) {
            console.error('Error getting pending arenas for admin:', error);
            throw error;
        }
    },

    updateArenaStatus: async (arenaId, declinedReason, status) => {
        try {
            const updatedArena = await prisma.arena.update({
                where: {
                    arenaId: parseInt(arenaId)
                },
                data: {
                    arenaStatus: status,
                    declinationReason: declinedReason
                }
            });

            return updatedArena;
        } catch (error) {
            console.error('Error updating arena status:', error);
            throw error;
        }
    },

    getPricingForNewArena: async () => {
        try {
            const pricing = await prisma.pricing.findFirst({
                where: {
                    activityName: 'Price for new arena addition'
                },
                select: {
                    price: true
                }
            });

            return pricing ? [pricing] : [];
        } catch (error) {
            console.error('Error getting pricing for new arena:', error);
            throw error;
        }
    },

    getArenasForOwnerWithStatus: async (ownerId) => {
        try {
            const arenas = await prisma.arena.findMany({
                where: {
                    ownerId: parseInt(ownerId),
                    paidStatus: 'Pending'
                },
                select: {
                    arenaId: true,
                    name: true,
                    city: true,
                    country: true,
                    description: true,
                    imageUrl: true,
                    arenaStatus: true,
                    declinationReason: true
                }
            });

            // Transform to match original structure
            return arenas.map(arena => ({
                arenaId: arena.arenaId,
                arenaName: arena.name,
                city: arena.city,
                country: arena.country,
                description: arena.description,
                image_url: arena.imageUrl,
                arenaStatus: arena.arenaStatus,
                declinationReason: arena.declinationReason
            }));
        } catch (error) {
            console.error('Error getting arenas for owner with status:', error);
            throw error;
        }
    },

    getArenaDetails: async (arenaId) => {
        try {
            const arena = await prisma.arena.findUnique({
                where: {
                    arenaId: parseInt(arenaId)
                }
            });

            return arena;
        } catch (error) {
            console.error('Error getting arena details:', error);
            throw error;
        }
    },

    markAsPaid: async (arenaId, invoiceUrl) => {
        try {
            const updatedArena = await prisma.arena.update({
                where: {
                    arenaId: parseInt(arenaId)
                },
                data: {
                    paidStatus: 'Paid',
                    invoiceUrl: invoiceUrl
                }
            });

            return updatedArena;
        } catch (error) {
            console.error('Error marking arena as paid:', error);
            throw error;
        }
    },

    setPriceForNewArena: async (arenaId, price) => {
        try {
            const updatedArena = await prisma.arena.update({
                where: {
                    arenaId: parseInt(arenaId)
                },
                data: {
                    amount: parseFloat(price)
                }
            });

            return updatedArena;
        } catch (error) {
            console.error('Error setting price for new arena:', error);
            throw error;
        }
    }
};

module.exports = arena;