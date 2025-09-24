const prisma = require('../prisma/client');

const review = {
    getReviewData: async () => {
        try {
            const arenas = await prisma.arena.findMany({
                select: {
                    arenaId: true,
                    name: true,
                    reviews: {
                        select: {
                            rating: true
                        }
                    }
                }
            });

            // Calculate average rating for each arena
            const reviewData = arenas.map(arena => {
                const ratings = arena.reviews.map(review => review.rating);
                const averageRating = ratings.length > 0 
                    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
                    : null;

                return {
                    arenaId: arena.arenaId,
                    arenaName: arena.name,
                    averageRating: averageRating ? parseFloat(averageRating.toFixed(2)) : null
                };
            });

            return reviewData;
        } catch (error) {
            console.error('Error getting review data:', error);
            throw error;
        }
    }
};

module.exports = review;