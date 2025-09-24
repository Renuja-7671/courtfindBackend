const AdminModel = require('../models/adminModel');
exports.dashboard = (req, res) => {
    res.json({ message: "Welcome to the Admin Dashboard", user: req.user.userId });
};

// Get admin profile
exports.getAdminProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log('Fetching admin profile for userId:', userId);
        
        const results = await AdminModel.getAdminProfile(userId);
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        console.log('User data found:', results[0]);
        const userData = {
            ...results[0],
        };
        res.json(userData);
        
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch user data: ' + error.message });
    }
};

// Update admin profile
exports.updateAdminProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { firstName, lastName, email } = req.body;
        
        // Basic validation
        if (!firstName || !email) {
            return res.status(400).json({ error: 'First name and email are required' });
        }
        
        const result = await AdminModel.updateAdminProfile(userId, { firstName, lastName, email });
        
        console.log('Update result:', result);
        res.json({ message: 'Profile updated successfully' });
        
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to update user data: ' + error.message });
    }
};

// Only allow fetching the price for new arena addition
const PRICING_TOPIC = "Price for new arena addition";
exports.getAllPricing = async (req, res) => {
    try {
        const result = await AdminModel.getArenaAdditionPricing();
        res.json(result ? [result] : []);
    } catch (error) {
        console.error('Error fetching pricing data:', error);
        res.status(500).json({ error: 'Failed to fetch pricing data' });
    }
};

// Update the price for new arena addition only
exports.updatePricing = async (req, res) => {
    try {
        const { id, price } = req.body;
        if (!id || !price) {
            return res.status(400).json({ error: 'ID and price are required' });
        }
        const result = await AdminModel.updatePricing({ id, activity_name: PRICING_TOPIC, price });
        res.json({ message: 'Pricing updated successfully' });
    } catch (error) {
        console.error('Error updating pricing:', error);
        res.status(500).json({ error: 'Failed to update pricing' });
    }
};

// Add the price for new arena addition only (if not exists)
exports.addPricing = async (req, res) => {
    try {
        const { price } = req.body;
        if (!price) {
            return res.status(400).json({ error: 'Price is required' });
        }
        const result = await AdminModel.addPricing({ activity_name: PRICING_TOPIC, price });
        res.status(201).json({ 
            message: 'Pricing added successfully',
            id: result.id,
            activity_name: PRICING_TOPIC,
            price
        });
    } catch (error) {
        console.error('Error adding pricing:', error);
        res.status(500).json({ error: 'Failed to add pricing' });
    }
};

// Delete a pricing item
exports.deletePricing = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }
        
        await AdminModel.deletePricing(id);
        res.json({ message: 'Pricing deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting pricing:', error);
        res.status(500).json({ error: 'Failed to delete pricing' });
    }
};

// Get all players
exports.getAllPlayers = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        
        const [players, totalPlayers] = await Promise.all([
            AdminModel.getAllPlayers({ search, page, limit }),
            AdminModel.getPlayersCount(search)
        ]);
        
        res.json({
            players,
            totalPlayers,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalPlayers / limit),
            hasMore: (page * limit) < totalPlayers
        });
        
    } catch (error) {
        console.error('Error fetching players data:', error);
        res.status(500).json({ error: 'Failed to fetch players data' });
    }
};

// Get player details by ID
exports.getPlayerById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: 'Player ID is required' });
        }
        
        const results = await AdminModel.getPlayerById(id);
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }
        
        res.json(results[0]);
        
    } catch (error) {
        console.error('Error fetching player details:', error);
        res.status(500).json({ error: 'Failed to fetch player details' });
    }
};

// Delete a player
exports.deletePlayer = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: 'Player ID is required' });
        }
        
        await AdminModel.deletePlayer(id);
        res.json({ message: 'Player deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting player:', error);
        res.status(500).json({ error: 'Failed to delete player' });
    }
};

// Get all owners
exports.getAllOwners = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        
        const [owners, totalOwners] = await Promise.all([
            AdminModel.getAllOwners({ search, page, limit }),
            AdminModel.getOwnersCount(search)
        ]);
        
        res.json({
            owners,
            totalOwners,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalOwners / limit),
            hasMore: (page * limit) < totalOwners
        });
        
    } catch (error) {
        console.error('Error fetching owners data:', error);
        res.status(500).json({ error: 'Failed to fetch owners data' });
    }
};

// Get owner details by ID
exports.getOwnerById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: 'owner ID is required' });
        }
        
        const results = await AdminModel.getOwnerById(id);
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Owner not found' });
        }
        
        res.json(results[0]);
        
    } catch (error) {
        console.error('Error fetching owner details:', error);
        res.status(500).json({ error: 'Failed to fetch owner details' });
    }
};

// Delete a Owner
exports.deleteOwner = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: 'Owner ID is required' });
        }
        
        await AdminModel.deleteOwner(id);
        res.json({ message: 'Owner deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting owner:', error);
        res.status(500).json({ error: 'Failed to delete owner' });
    }
};

//analytics counts
exports.getUserStats = async (req, res) => {
  try {
    const { search } = req.query;
    const [totalUsers, totalPlayers, totalOwners, totalRevenue] = await Promise.all([
      AdminModel.getTotalUsersCount(search),
      AdminModel.getPlayersCount(search),
      AdminModel.getOwnersCount(search),
      AdminModel.getTotalRevenue() 
    ]);
    
    res.json({
      totalUsers,      // Total users excluding Admins
      totalPlayers,    // Total players
      totalOwners,     // Total owners
      totalRevenue     // Total revenue from revenue table 
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
};

exports.getRevenueByActivity = async (req, res) => {
  try {
    const revenueData = await AdminModel.getRevenueByActivity();
    res.json({ revenueByActivity: revenueData });
  } catch (error) {
    console.error('Error fetching revenue by activity:', error);
    res.status(500).json({ error: 'Failed to fetch revenue by activity' });
  }
};

exports.getTopRatedArenas = async (req, res) => {
  try {
    const topRatedArenas = await AdminModel.getTopRatedArenas();
    res.json({ topRatedArenas });
  } catch (error) {
    console.error('Error fetching top rated arenas:', error);
    res.status(500).json({ error: 'Failed to fetch top rated arenas' });
  }
};

exports.getMonthlyRevenueAnalysis = async (req, res) => {
  try {
    const { month, year } = req.query; // Expect month (1-12) and year as query params
    const analysisData = await AdminModel.getMonthlyRevenueAnalysis(month, year || 2025);
    res.json({ analysisData });
  } catch (error) {
    console.error('Error fetching monthly revenue analysis:', error);
    res.status(500).json({ error: 'Failed to fetch monthly revenue analysis' });
  }
};

// Updated: Method to get revenue breakdown
exports.getRevenueBreakdown = async (req, res) => {
  try {
    const revenueData = await AdminModel.getRevenueBreakdown();
    res.json(revenueData);
  } catch (error) {
    console.error('Error fetching revenue breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch revenue breakdown', details: error.message });
  }
};