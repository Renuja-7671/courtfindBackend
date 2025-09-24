const prisma = require('../prisma/client');

const AdminModel = {
  // Admin Profile Methods
  getAdminProfile: async (userId) => {
    try {
      const admin = await prisma.user.findUnique({
        where: { userId: parseInt(userId) },
        select: {
          firstName: true,
          lastName: true,
          email: true
        }
      });
      
      return admin ? [admin] : [];
    } catch (error) {
      console.error('Error getting admin profile:', error);
      throw error;
    }
  },

  updateAdminProfile: async (userId, userData) => {
    try {
      const { firstName, lastName, email } = userData;
      const updatedAdmin = await prisma.user.update({
        where: { userId: parseInt(userId) },
        data: {
          firstName: firstName,
          lastName: lastName || '',
          email: email
        }
      });
      
      return updatedAdmin;
    } catch (error) {
      console.error('Error updating admin profile:', error);
      throw error;
    }
  },

  // Pricing Methods

  // Only get the price for new arena addition
  getArenaAdditionPricing: async () => {
    try {
      const pricing = await prisma.pricing.findFirst({
        where: { activityName: "Price for new arena addition" },
      });
      return pricing;
    } catch (error) {
      console.error('Error getting arena addition pricing:', error);
      throw error;
    }
  },

  updatePricing: async (pricingData) => {
    try {
      const { id, price } = pricingData;
      const updatedPricing = await prisma.pricing.update({
        where: { id: parseInt(id) },
        data: {
          activityName: "Price for new arena addition",
          price: parseFloat(price)
        }
      });
      return updatedPricing;
    } catch (error) {
      console.error('Error updating pricing:', error);
      throw error;
    }
  },

  addPricing: async (pricingData) => {
    try {
      const { price } = pricingData;
      // Check if already exists
      const existing = await prisma.pricing.findFirst({ where: { activityName: "Price for new arena addition" } });
      if (existing) {
        throw new Error('Pricing for new arena addition already exists');
      }
      const newPricing = await prisma.pricing.create({
        data: {
          activityName: "Price for new arena addition",
          price: parseFloat(price)
        }
      });
      return newPricing;
    } catch (error) {
      console.error('Error adding pricing:', error);
      throw error;
    }
  },

  deletePricing: async (id) => {
    try {
      const deletedPricing = await prisma.pricing.delete({
        where: { id: parseInt(id) }
      });
      
      return deletedPricing;
    } catch (error) {
      console.error('Error deleting pricing:', error);
      throw error;
    }
  },

  // Player Management Methods
  getAllPlayers: async (searchParams) => {
    try {
      const { search, page = 1, limit = 10 } = searchParams;
      
      const whereClause = { role: 'Player' };
      
      // Add search functionality
      if (search && search.trim()) {
        const searchTerm = search.trim();
        whereClause.OR = [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } }
        ];
      }
      
      const players = await prisma.user.findMany({
        where: whereClause,
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          mobile: true,
          country: true,
          province: true,
          zip: true,
          address: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      });
      
      // Transform to match original structure
      return players.map(player => ({
        ...player,
        created_at: player.createdAt
      }));
    } catch (error) {
      console.error('Error getting all players:', error);
      throw error;
    }
  },

  getPlayersCount: async (search) => {
    try {
      const whereClause = { role: 'Player' };
      
      if (search && search.trim()) {
        const searchTerm = search.trim();
        whereClause.OR = [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } }
        ];
      }
      
      const count = await prisma.user.count({
        where: whereClause
      });
      
      return count;
    } catch (error) {
      console.error('Error getting players count:', error);
      throw error;
    }
  },

  getPlayerById: async (id) => {
    try {
      const player = await prisma.user.findFirst({
        where: {
          userId: parseInt(id),
          role: 'Player'
        },
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          mobile: true,
          country: true,
          province: true,
          zip: true,
          address: true,
          createdAt: true
        }
      });
      
      return player ? [{ ...player, created_at: player.createdAt }] : [];
    } catch (error) {
      console.error('Error getting player by ID:', error);
      throw error;
    }
  },

  deletePlayer: async (id) => {
    try {
      const deletedPlayer = await prisma.user.delete({
        where: { userId: parseInt(id) }
      });
      
      return deletedPlayer;
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  },

  // Owner Management Methods
  getAllOwners: async (searchParams) => {
    try {
      const { search, page = 1, limit = 10 } = searchParams;
      
      const whereClause = { role: 'Owner' };
      
      // Add search functionality
      if (search && search.trim()) {
        const searchTerm = search.trim();
        whereClause.OR = [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } }
        ];
      }
      
      const owners = await prisma.user.findMany({
        where: whereClause,
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          mobile: true,
          country: true,
          province: true,
          zip: true,
          address: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      });
      
      // Transform to match original structure
      return owners.map(owner => ({
        ...owner,
        created_at: owner.createdAt
      }));
    } catch (error) {
      console.error('Error getting all owners:', error);
      throw error;
    }
  },

  getOwnersCount: async (search) => {
    try {
      const whereClause = { role: 'Owner' };
      
      if (search && search.trim()) {
        const searchTerm = search.trim();
        whereClause.OR = [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } }
        ];
      }
      
      const count = await prisma.user.count({
        where: whereClause
      });
      
      return count;
    } catch (error) {
      console.error('Error getting owners count:', error);
      throw error;
    }
  },

  getOwnerById: async (id) => {
    try {
      const owner = await prisma.user.findFirst({
        where: {
          userId: parseInt(id),
          role: 'Owner'
        },
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          mobile: true,
          country: true,
          province: true,
          zip: true,
          address: true,
          createdAt: true
        }
      });
      
      return owner ? [{ ...owner, created_at: owner.createdAt }] : [];
    } catch (error) {
      console.error('Error getting owner by ID:', error);
      throw error;
    }
  },

  deleteOwner: async (id) => {
    try {
      const deletedOwner = await prisma.user.delete({
        where: { userId: parseInt(id) }
      });
      
      return deletedOwner;
    } catch (error) {
      console.error('Error deleting owner:', error);
      throw error;
    }
  },

  // Total users for analytics
  getTotalUsersCount: async (search) => {
    try {
      const whereClause = {
        role: { not: 'Admin' }
      };
      
      if (search && search.trim()) {
        const searchTerm = search.trim();
        whereClause.OR = [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } }
        ];
      }
      
      const count = await prisma.user.count({
        where: whereClause
      });
      
      return count;
    } catch (error) {
      console.error('Error getting total users count:', error);
      throw error;
    }
  },

  // Get total revenue for analytics
  getTotalRevenue: async () => {
    try {
      const result = await prisma.payment.aggregate({
        _sum: { amount: true }
      });
      
      return result._sum.amount || 0;
    } catch (error) {
      console.error('Error getting total revenue:', error);
      throw error;
    }
  },

  getRevenueByActivity: async () => {
    try {
      const revenues = await prisma.payment.groupBy({
        by: ['arenaId'],
        where: {
          arenaId: { not: null }
        },
        _sum: { amount: true }
      });
      
      // Get arena names for each group
      const data = await Promise.all(
        revenues.map(async (revenue) => {
          const arena = await prisma.arena.findUnique({
            where: { arenaId: revenue.arenaId },
            select: { name: true }
          });
          
          return {
            activity_name: arena?.name || 'Unknown',
            total_amount: parseFloat(revenue._sum.amount) || 0
          };
        })
      );
      
      return data;
    } catch (error) {
      console.error('Error getting revenue by activity:', error);
      throw error;
    }
  },

  getTopRatedArenas: async () => {
    try {
      const arenas = await prisma.arena.findMany({
        include: {
          reviews: {
            select: { rating: true }
          }
        }
      });
      
      const data = arenas.map(arena => {
        const ratings = arena.reviews.map(review => review.rating);
        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;
        
        return {
          arenaId: arena.arenaId,
          name: arena.name,
          city: arena.city,
          country: arena.country,
          average_rating: parseFloat(averageRating.toFixed(2))
        };
      }).sort((a, b) => b.average_rating - a.average_rating);
      
      return data;
    } catch (error) {
      console.error('Error getting top rated arenas:', error);
      throw error;
    }
  },

  getMonthlyRevenueAnalysis: async (month, year) => {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const payments = await prisma.payment.groupBy({
        by: ['paymentDesc'],
        where: {
          paidAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: { paymentId: true },
        _sum: { amount: true }
      });
      
      const data = payments.map(payment => {
        // Remove numbers and colons from payment description (similar to REGEXP_REPLACE)
        const activityName = payment.paymentDesc?.replace(/[0-9:]+/g, '') || 'Unknown';
        
        return {
          activity_name: activityName,
          total_amount: parseFloat(payment._sum.amount) || 0
        };
      });
      
      return data;
    } catch (error) {
      console.error('Error getting monthly revenue analysis:', error);
      throw error;
    }
  },

  getRevenueBreakdown: async () => {
    try {
      const adminRevenue = await prisma.payment.aggregate({
        where: { playerId: null },
        _sum: { amount: true }
      });
      
      const ownerRevenue = await prisma.payment.aggregate({
        where: { playerId: { not: null } },
        _sum: { amount: true }
      });
      
      return {
        adminRevenue: adminRevenue._sum.amount || 0,
        ownerRevenue: ownerRevenue._sum.amount || 0
      };
    } catch (error) {
      console.error('Error getting revenue breakdown:', error);
      throw error;
    }
  }
};

module.exports = AdminModel;