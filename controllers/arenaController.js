const arena = require("../models/arenaModel");

exports.getAllArenas = async (req, res) => {
    try {
        arena.getAllArenas((err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "No arenas found" });
            }
            console.log("All arenas:", results); // Debugging line
            res.json(results);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.searchArenas = async (req, res) => {
    const { sport, venue } = req.query;
    if (!sport && !venue) {
        return res.status(400).json({ error: "At least one filter (sport or venue) is required." });
    }
    try {
        arena.searchArenas(sport, venue, (err, results) => {
            if (err) {
                console.error("Database error:", err);
                // Log the error for debugging
                console.error("Error details:", err); // Debugging line
                return res.status(500).json({ error: "Database error" });
            }
            if (results.length === 0) {
                console.log("No arenas found for the given filters."); // Debugging line
                return res.status(404).json({ message: "No arenas found" });
            }
            //console.log("Search results:", results); // Debugging line
            res.json(results);
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addArena = async (req, res) => {
    const { name, city, description, image_url } = req.body;
    const ownerId = req.user.userId;

    if (!name || !city || !description || !image_url) {
        return res.status(400).json({ error: "All fields are required"});
    }

    try {
        arena.addArena(ownerId, name, city, description, image_url, (err, results) => {
            if (err) {
                console.error("Database error:",err);
                return res.status(500).json({ error:"Database error" });
            }
            res.status(201).json({ message: "Arena added succesfully", arenaId: results.insertId});
        });
    } catch (err) {
        res.status(500).json({ error: err.message});
    }
};

exports.uploadArenaImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });
        //console.log("The uploaded file is: ", req.file);
        const imageUrl = `${req.file.path}`; // relative path
        res.json({ message: "Image uploaded successfully", imageUrl });
    } catch (error) {
        res.status(500).json({ message: "Error uploading arena image", error });
    }
};

exports.getArenaByRating = async (req, res) => {
    try {
        arena.getArenaByRating((err, results) => {
            if (err) {
                console.error("Database error while fetching arenas by rating:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }

            res.json(results); // Send back the list of arenas ordered by rating
        });
    } catch (error) {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: "Unexpected error", error });
    }};


    //for manage arenas page
    exports.getArenasByOwner = (req, res) => {
    const ownerId = req.user.userId;

    arena.getArenasByOwner(ownerId, (err, results) => {
        if (err) {
        console.error("Error fetching arenas by owner:", err);
        return res.status(500).json({ message: "Failed to fetch arenas." });
        }

        if (results.length === 0) {
        return res.status(404).json({ message: "No arenas found for this owner." });
        }

        return res.status(200).json(results);
    });
    };

    exports.updateArenaName = (req, res) => {
    const { arenaId } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Arena name is required." });
    }

    arena.updateArenaName(arenaId, name, (err, result) => {
        if (err) {
        console.error("Error updating arena name:", err);
        return res.status(500).json({ message: "Failed to update arena name." });
        }

        if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Arena not found." });
        }
        return res.status(200).json({ message: "Arena name updated successfully." });
    });
    };

exports.deleteArena = (req, res) => {
  const arenaId = req.params.arenaId;
  console.log("Delete request received for arenaId:", arenaId);

  const checkCourtsQuery = "SELECT COUNT(*) AS courtCount FROM courts WHERE arenaId = ?";
  db.query(checkCourtsQuery, [arenaId], (err, results) => {
    if (err) {
      console.error("Court check failed:", err);
      return res.status(500).json({ message: "Error checking courts", error: err.message });
    }

    const courtCount = results[0].courtCount;
    console.log("Court count:", courtCount);

    if (courtCount > 0) {
      console.log("Arena has courts. Not deleting.");
      return res.status(400).json({ message: "Cannot delete arena. Courts still exist." });
    }

    db.beginTransaction((err) => {
      if (err) {
        console.error("Transaction start failed:", err);
        return res.status(500).json({ message: "Failed to start transaction", error: err.message });
      }

      console.log("Transaction started");

      const deleteQueries = [
        { query: "DELETE FROM payments WHERE arenaId = ?", label: "payments" },
        { query: "DELETE FROM bookings WHERE arenaId = ?", label: "bookings" },
        { query: "DELETE FROM reviews WHERE arenaId = ?", label: "reviews" },
        { query: "DELETE FROM arena_sports WHERE arenaId = ?", label: "arena_sports" },
        { query: "DELETE FROM arenas WHERE arenaId = ?", label: "arenas" },
      ];

      let promiseChain = Promise.resolve();

      deleteQueries.forEach(({ query, label }) => {
        promiseChain = promiseChain.then(() => {
          return new Promise((resolve, reject) => {
            console.log(`Running delete on ${label}`);
            db.query(query, [arenaId], (err) => {
              if (err) {
                console.error(`Delete failed for ${label}:`, err);
                return reject(err);
              }
              console.log(`Deleted from ${label}`);
              resolve();
            });
          });
        });
      });

      promiseChain
        .then(() => {
          db.commit((err) => {
            if (err) {
              console.error("Commit failed:", err);
              db.rollback(() => {
                return res.status(500).json({ message: "Transaction commit failed", error: err.message });
              });
            } else {
              console.log("Transaction committed. Arena deleted.");
              return res.status(200).json({ message: "Arena deleted successfully." });
            }
          });
        })
        .catch((deleteErr) => {
          console.error("Delete chain failed:", deleteErr);
          db.rollback(() => {
            return res.status(500).json({ message: "Delete failed", error: deleteErr.message });
          });
        });
    });
  });
};

exports.getPendingArenas = (req, res) => {
    const userId = req.user.userId;
    arena.getPendingArenas( userId, (err, results) => {
        if (err) {
            console.error("Error fetching pending arenas:", err);
            return res.status(500).json({ message: "Failed to fetch pending arenas." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No pending arenas found." });
        }

        return res.status(200).json(results);
    });
};

exports.getPendingArenasForAdmin = (req, res) => {
    arena.getPendingArenasForAdmin((err, results) => {
        if (err) {
            console.error("Error fetching pending arenas for admin:", err);
            return res.status(500).json({ message: "Failed to fetch pending arenas." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No pending arenas found." });
        }

        return res.status(200).json(results);
    }
    );
};

exports.updateArenaStatus = (req, res) => {
    const { arenaId } = req.params;
    const { declinedReason, status } = req.body;

    if (!status) {
        return res.status(400).json({ message: "Arena status is required." });
    }

    arena.updateArenaStatus(arenaId, declinedReason, status, (err, result) => {
        if (err) {
            console.error("Error updating arena status:", err);
            return res.status(500).json({ message: "Failed to update arena status." });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Arena not found." });
        }

        return res.status(200).json({ message: "Arena status updated successfully." });
    });
};

exports.getPricingForNewArena = (req, res) => {
    arena.getPricingForNewArena((err, results) => {
        if (err) {
            console.error("Error fetching pricing for new arena:", err);
            return res.status(500).json({ message: "Failed to fetch pricing." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No pricing information found." });
        }

        return res.status(200).json(results);
    });
};

exports.getArenasForOwnerWithStatus = (req, res) => {
    const ownerId = req.user.userId;

    arena.getArenasForOwnerWithStatus(ownerId, (err, results) => {
        if (err) {
            console.error("Error fetching arenas for owner:", err);
            return res.status(500).json({ message: "Failed to fetch arenas." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "No arenas found for this owner." });
        }
        console.log("Arenas with status for owner:", results); // Debugging line

        return res.status(200).json(results);
    });
};
