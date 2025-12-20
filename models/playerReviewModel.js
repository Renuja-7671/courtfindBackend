const prisma = require('../prisma/client');

const PlayerReview = {
  // Get reviews for a specific court
  getReviewsByCourtId: async (courtId) => {
    try {
      const reviews = await prisma.review.findMany({
        where: {
          courtId: parseInt(courtId)
        },
        include: {
          player: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Transform to match original structure
      return reviews.map(review => ({
        firstName: review.player.firstName,
        lastName: review.player.lastName,
        comment: review.comment,
        rating: review.rating,
        created_at: review.createdAt
      }));
    } catch (error) {
      console.error('Error getting reviews by court ID:', error);
      throw error;
    }
  },

  // Add a new review
  addReview: async (playerId, arenaId, courtId, rating, comment) => {
    try {
      const review = await prisma.review.create({
        data: {
          playerId: parseInt(playerId),
          arenaId: parseInt(arenaId),
          courtId: parseInt(courtId),
          rating: parseInt(rating),
          comment: comment
        }
      });
      return review;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  },

  // Get arenaId from courtId
  getArenaIdByCourtId: async (courtId) => {
    try {
      const court = await prisma.court.findUnique({
        where: {
          courtId: parseInt(courtId)
        },
        select: {
          arenaId: true
        }
      });
      return court;
    } catch (error) {
      console.error('Error getting arena ID by court ID:', error);
      throw error;
    }
  },

  // Get average rating
  getAverageRatingByCourtId: async (courtId) => {
    try {
      const result = await prisma.review.aggregate({
        where: {
          courtId: parseInt(courtId)
        },
        _avg: {
          rating: true
        }
      });
      
      return {
        averageRating: result._avg.rating
      };
    } catch (error) {
      console.error('Error getting average rating by court ID:', error);
      throw error;
    }
  },

  // Get review stats (count and sum)
  getReviewStats: async (courtId) => {
    try {
      const result = await prisma.review.aggregate({
        where: {
          courtId: parseInt(courtId)
        },
        _count: {
          reviewId: true
        },
        _sum: {
          rating: true
        }
      });

      return {
        total_reviews: result._count.reviewId,
        total_ratings: result._sum.rating
      };
    } catch (error) {
      console.error('Error getting review stats:', error);
      throw error;
    }
  }
};

module.exports = PlayerReview;