const prisma = require('../prisma/client');

const Sport = {
    // Get all sports - converted from callback to async/await
    getAllSports: async () => {
        try {
            const sports = await prisma.sport.findMany({
                orderBy: {
                    name: 'asc'
                }
            });
            return sports;
        } catch (error) {
            console.error('Error getting all sports:', error);
            throw error;
        }
    },

    // Search sports by name or type - converted with proper search functionality
    searchSports: async (sport) => {
        try {
            const sports = await prisma.sport.findMany({
                where: {
                    OR: [
                        {
                            name: {
                                contains: sport,
                                mode: 'insensitive'
                            }
                        },
                        {
                            sportType: {
                                contains: sport,
                                mode: 'insensitive'
                            }
                        }
                    ]
                },
                orderBy: {
                    name: 'asc'
                }
            });
            return sports;
        } catch (error) {
            console.error('Error searching sports:', error);
            throw error;
        }
    },

    // Alternative search method that handles empty search term
    searchSportsFlexible: async (sport) => {
        try {
            // If no search term provided, return all sports
            if (!sport || sport.trim() === '') {
                return await Sport.getAllSports();
            }

            return await Sport.searchSports(sport);
        } catch (error) {
            console.error('Error in flexible sports search:', error);
            throw error;
        }
    },

    // Get sport by ID - converted from callback
    getSportById: async (sportId) => {
        try {
            const sport = await prisma.sport.findUnique({
                where: {
                    sportId: parseInt(sportId)
                }
            });
            return sport;
        } catch (error) {
            console.error('Error getting sport by ID:', error);
            throw error;
        }
    },

    // Add new sport - converted with automatic return of created sport
    addSport: async (sport) => {
        try {
            const newSport = await prisma.sport.create({
                data: {
                    name: sport.name,
                    noOfPlayer: parseInt(sport.noOfPlayer),
                    sportType: sport.sportType
                }
            });
            return newSport;
        } catch (error) {
            console.error('Error adding sport:', error);
            throw error;
        }
    },

    // Update sport - converted with automatic return of updated sport
    updateSport: async (sportId, sport) => {
        try {
            const updatedSport = await prisma.sport.update({
                where: {
                    sportId: parseInt(sportId)
                },
                data: {
                    name: sport.name,
                    noOfPlayer: parseInt(sport.noOfPlayer),
                    sportType: sport.sportType
                }
            });
            return updatedSport;
        } catch (error) {
            console.error('Error updating sport:', error);
            throw error;
        }
    },

    // Delete sport - converted with boolean return for success/failure
    deleteSport: async (sportId) => {
        try {
            const deletedSport = await prisma.sport.delete({
                where: {
                    sportId: parseInt(sportId)
                }
            });
            return true; // Return true if deletion was successful
        } catch (error) {
            // If sport doesn't exist, Prisma will throw an error
            if (error.code === 'P2025') {
                console.log(`Sport with ID ${sportId} not found`);
                return false;
            }
            console.error('Error deleting sport:', error);
            throw error;
        }
    },

    // Get sport by name - converted from callback
    getSportByName: async (name) => {
        try {
            const sport = await prisma.sport.findFirst({
                where: {
                    name: {
                        equals: name,
                        mode: 'insensitive' // Case insensitive search
                    }
                }
            });
            return sport;
        } catch (error) {
            console.error('Error getting sport by name:', error);
            throw error;
        }
    },

    // Get sport by exact name (case sensitive)
    getSportByNameExact: async (name) => {
        try {
            const sport = await prisma.sport.findFirst({
                where: {
                    name: name
                }
            });
            return sport;
        } catch (error) {
            console.error('Error getting sport by exact name:', error);
            throw error;
        }
    },

    // Get sport by type - converted (note: your original query used 'type' but schema shows 'sportType')
    getSportByType: async (type) => {
        try {
            const sports = await prisma.sport.findMany({
                where: {
                    sportType: {
                        equals: type,
                        mode: 'insensitive'
                    }
                },
                orderBy: {
                    name: 'asc'
                }
            });
            return sports;
        } catch (error) {
            console.error('Error getting sports by type:', error);
            throw error;
        }
    },

    // Get sport by number of players - converted
    getSportByNoOfPlayer: async (noOfPlayer) => {
        try {
            const sports = await prisma.sport.findMany({
                where: {
                    noOfPlayer: parseInt(noOfPlayer)
                },
                orderBy: {
                    name: 'asc'
                }
            });
            return sports;
        } catch (error) {
            console.error('Error getting sports by number of players:', error);
            throw error;
        }
    },

    // Additional useful methods

    // Check if sport exists by name (useful for validation)
    sportExistsByName: async (name) => {
        try {
            const sport = await Sport.getSportByName(name);
            return !!sport;
        } catch (error) {
            console.error('Error checking if sport exists:', error);
            throw error;
        }
    },

    // Get sports with player count in range
    getSportsByPlayerRange: async (minPlayers, maxPlayers) => {
        try {
            const sports = await prisma.sport.findMany({
                where: {
                    noOfPlayer: {
                        gte: parseInt(minPlayers),
                        lte: parseInt(maxPlayers)
                    }
                },
                orderBy: {
                    noOfPlayer: 'asc'
                }
            });
            return sports;
        } catch (error) {
            console.error('Error getting sports by player range:', error);
            throw error;
        }
    },

    // Get count of all sports
    countSports: async () => {
        try {
            const count = await prisma.sport.count();
            return count;
        } catch (error) {
            console.error('Error counting sports:', error);
            throw error;
        }
    },

    // Get unique sport types
    getUniqueSportTypes: async () => {
        try {
            const sports = await prisma.sport.findMany({
                select: {
                    sportType: true
                },
                distinct: ['sportType']
            });
            return sports.map(sport => sport.sportType).filter(type => type !== null);
        } catch (error) {
            console.error('Error getting unique sport types:', error);
            throw error;
        }
    }
};

module.exports = Sport;