const db = require('../config/db'); // MySQL connection

const AdminModel = {
  // Admin Profile Methods
  getAdminProfile: (userId) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT firstName, lastName, email FROM users WHERE userId = ?';
      db.query(query, [userId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  updateAdminProfile: (userId, userData) => {
    return new Promise((resolve, reject) => {
      const { firstName, lastName, email } = userData;
      const query = 'UPDATE users SET firstName = ?, lastName = ?, email = ? WHERE userId = ?';
      
      db.query(query, [firstName, lastName || '', email, userId], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  // Pricing Methods
  getAllPricing: () => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM pricing ORDER BY id ASC';
      
      db.query(query, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  updatePricing: (pricingData) => {
    return new Promise((resolve, reject) => {
      const { id, activity_name, price } = pricingData;
      const query = 'UPDATE pricing SET activity_name = ?, price = ? WHERE id = ?';
      
      db.query(query, [activity_name, price, id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  addPricing: (pricingData) => {
    return new Promise((resolve, reject) => {
      const { activity_name, price } = pricingData;
      const query = 'INSERT INTO pricing (activity_name, price) VALUES (?, ?)';
      
      db.query(query, [activity_name, price], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  deletePricing: (id) => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM pricing WHERE id = ?';
      
      db.query(query, [id], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  // Player Management Methods
  getAllPlayers: (searchParams) => {
    return new Promise((resolve, reject) => {
      const { search, page = 1, limit = 10 } = searchParams;
      
      let query = 'SELECT userId, firstName, lastName, email, mobile, country, province, zip, address, created_at FROM users WHERE role = ?';
      let queryParams = ['Player'];
      
      // Add search functionality
      if (search && search.trim()) {
        query += ' AND (firstName LIKE ? OR lastName LIKE ? OR CONCAT(firstName, " ", lastName) LIKE ?)';
        const searchTerm = `%${search.trim()}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      // Add ordering
      query += ' ORDER BY created_at DESC';
      
      // Add pagination
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(parseInt(limit), offset);
      
      db.query(query, queryParams, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  getPlayersCount: (search) => {
    return new Promise((resolve, reject) => {
      let countQuery = 'SELECT COUNT(*) as total FROM users WHERE role = ?';
      let countParams = ['Player'];
      
      if (search && search.trim()) {
        countQuery += ' AND (firstName LIKE ? OR lastName LIKE ? OR CONCAT(firstName, " ", lastName) LIKE ?)';
        const searchTerm = `%${search.trim()}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      db.query(countQuery, countParams, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0].total);
        }
      });
    });
  },

  getPlayerById: (id) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT userId, firstName, lastName, email, mobile, country, province, zip, address, created_at FROM users WHERE userId = ? AND role = ?';
      
      db.query(query, [id, 'Player'], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  deletePlayer: (id) => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM users WHERE userId = ? AND role = ?';
      
      db.query(query, [id, 'Player'], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },


// Owner Management Methods
  getAllOwners: (searchParams) => {
    return new Promise((resolve, reject) => {
      const { search, page = 1, limit = 10 } = searchParams;
      
      let query = 'SELECT userId, firstName, lastName, email, mobile, country, province, zip, address, created_at FROM users WHERE role = ?';
      let queryParams = ['Owner'];
      
      // Add search functionality
      if (search && search.trim()) {
        query += ' AND (firstName LIKE ? OR lastName LIKE ? OR CONCAT(firstName, " ", lastName) LIKE ?)';
        const searchTerm = `%${search.trim()}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      // Add ordering
      query += ' ORDER BY created_at DESC';
      
      // Add pagination
      const offset = (page - 1) * limit;
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(parseInt(limit), offset);
      
      db.query(query, queryParams, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  getOwnersCount: (search) => {
    return new Promise((resolve, reject) => {
      let countQuery = 'SELECT COUNT(*) as total FROM users WHERE role = ?';
      let countParams = ['Owner'];
      
      if (search && search.trim()) {
        countQuery += ' AND (firstName LIKE ? OR lastName LIKE ? OR CONCAT(firstName, " ", lastName) LIKE ?)';
        const searchTerm = `%${search.trim()}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      db.query(countQuery, countParams, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0].total);
        }
      });
    });
  },

  getOwnerById: (id) => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT userId, firstName, lastName, email, mobile, country, province, zip, address, created_at FROM users WHERE userId = ? AND role = ?';
      
      db.query(query, [id, 'Owner'], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },

  deleteOwner: (id) => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM users WHERE userId = ? AND role = ?';
      
      db.query(query, [id, 'Owner'], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },
//tottal users for analytics
  getTotalUsersCount: (search) => {
  return new Promise((resolve, reject) => {
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE role != ?';
    let countParams = ['Admin'];
    
    if (search && search.trim()) {
      countQuery += ' AND (firstName LIKE ? OR lastName LIKE ? OR CONCAT(firstName, " ", lastName) LIKE ?)';
      const searchTerm = `%${search.trim()}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    db.query(countQuery, countParams, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results[0].total);
      }
    });
  });
},


//get tot revenue for analytics

getTotalRevenue: () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT SUM(amount) as totalRevenue FROM payments';
    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        // If there are no revenue entries, return 0 as the total
        const totalRevenue = results[0].totalRevenue || 0;
        resolve(totalRevenue);
      }
    });
  });
},

getRevenueByActivity: () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT a.name as activity_name, SUM(p.amount) as total_amount
      FROM payments p
      join arenas a on p.arenaId = a.arenaId
      GROUP BY a.name
    `;
    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        const data = results.map(row => ({
          activity_name: row.activity_name,
          total_amount: parseFloat(row.total_amount) || 0
        }));
        resolve(data);
      }
    });
  });
},

getTopRatedArenas: () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT a.arenaId, a.name, a.city, a.country, AVG(r.rating) as average_rating
      FROM arenas a
      LEFT JOIN reviews r ON a.arenaId = r.arenaId
      GROUP BY a.arenaId, a.name, a.city, a.country
      ORDER BY average_rating DESC
    `;
    db.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        const data = results.map(row => ({
          arenaId: row.arenaId,
          name: row.name,
          city: row.city,
          country: row.country,
          average_rating: parseFloat(row.average_rating) || 0
        }));
        resolve(data);
      }
    });
  });
},



getMonthlyRevenueAnalysis: (month, year) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
      REGEXP_REPLACE(paymentDesc, '[0-9:]+', '') AS activity_name,
      COUNT(*) AS count,
      SUM(amount) AS total_amount
      from payments
      WHERE DATE_FORMAT(paid_at, '%Y-%m') = ?
      GROUP BY activity_name
    `;
    db.query(query, [`${year}-${month.toString().padStart(2, '0')}`], (err, results) => {
      if (err) {
        reject(err);
      } else {
        const data = results.map(row => ({
          activity_name: row.activity_name,
          total_amount: parseFloat(row.total_amount) || 0
        }));
        resolve(data);
      }
    });
  });
},

getRevenueBreakdown: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COALESCE((SELECT SUM(amount) FROM payments WHERE playerId IS NULL), 0) as adminRevenue,
          COALESCE((SELECT SUM(amount) FROM payments WHERE playerId IS NOT NULL), 0) as ownerRevenue
      `;
      db.query(query, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results[0]); // Return the first row with both revenues
        }
      });
    });
  }

};

module.exports = AdminModel;
