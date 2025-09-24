const arena = require("../models/arenaModel");

exports.getAllArenas = async (req, res) => {
    try {
        const results = await arena.getAllArenas();
        
        if (results.length === 0) {
            return res.status(404).json({ message: "No arenas found" });
        }
        console.log("All arenas:", results); // Debugging line
        res.json(results);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Database error" });
    }
};

exports.searchArenas = async (req, res) => {
    try {
        const { sport, venue } = req.query;
        if (!sport && !venue) {
            return res.status(400).json({ error: "At least one filter (sport or venue) is required." });
        }

        const results = await arena.searchArenas(sport, venue);
        
        if (results.length === 0) {
            console.log("No arenas found for the given filters."); // Debugging line
            return res.status(404).json({ message: "No arenas found" });
        }
        //console.log("Search results:", results); // Debugging line
        res.json(results);
    } catch (error) {
        console.error("Database error:", error);
        console.error("Error details:", error); // Debugging line
        res.status(500).json({ error: "Database error" });
    }
};

exports.addArena = async (req, res) => {
    try {
        const { name, city, description, image_url } = req.body;
        const ownerId = req.user.userId;

        if (!name || !city || !description || !image_url) {
            return res.status(400).json({ error: "All fields are required"});
        }

        const result = await arena.addArena(ownerId, name, city, description, image_url);
        res.status(201).json({ message: "Arena added successfully", arenaId: result.arenaId});
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Database error" });
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
        const results = await arena.getArenaByRating();
        res.json(results); // Send back the list of arenas ordered by rating
    } catch (error) {
        console.error("Database error while fetching arenas by rating:", error);
        res.status(500).json({ message: "Database error", error });
    }
};

//for manage arenas page
exports.getArenasByOwner = async (req, res) => {
    try {
        const ownerId = req.user.userId;

        const results = await arena.getArenasByOwner(ownerId);
        
        if (results.length === 0) {
            return res.status(404).json({ message: "No arenas found for this owner." });
        }

        return res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching arenas by owner:", error);
        res.status(500).json({ message: "Failed to fetch arenas." });
    }
};

exports.updateArenaName = async (req, res) => {
    try {
        const { arenaId } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Arena name is required." });
        }

        const result = await arena.updateArenaName(arenaId, name);
        
        if (!result) {
            return res.status(404).json({ message: "Arena not found." });
        }
        
        return res.status(200).json({ message: "Arena name updated successfully." });
    } catch (error) {
        console.error("Error updating arena name:", error);
        res.status(500).json({ message: "Failed to update arena name." });
    }
};

exports.deleteArena = async (req, res) => {
    try {
        const arenaId = req.params.arenaId;
        console.log("Delete request received for arenaId:", arenaId);

        const result = await arena.removeArena(arenaId);
        
        if (!result) {
            return res.status(404).json({ message: "Arena not found." });
        }
        
        console.log("Arena deleted successfully.");
        return res.status(200).json({ message: "Arena deleted successfully." });
    } catch (error) {
        console.error("Error deleting arena:", error);
        
        if (error.code === 'P2003') {
            return res.status(400).json({ 
                message: "Cannot delete arena. It has associated courts or bookings." 
            });
        }
        
        res.status(500).json({ message: "Failed to delete arena", error: error.message });
    }
};

exports.getPendingArenas = async (req, res) => {
    try {
        const userId = req.user.userId;
        const results = await arena.getPendingArenas(userId);

        return res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching pending arenas:", error);
        res.status(500).json({ message: "Failed to fetch pending arenas." });
    }
};

exports.getPendingArenasForAdmin = async (req, res) => {
    try {
        const results = await arena.getPendingArenasForAdmin();
        
        if (results.length === 0) {
            return res.status(404).json({ message: "No pending arenas found." });
        }

        return res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching pending arenas for admin:", error);
        res.status(500).json({ message: "Failed to fetch pending arenas." });
    }
};

exports.updateArenaStatus = async (req, res) => {
    try {
        const { arenaId } = req.params;
        const { declinedReason, status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "Arena status is required." });
        }

        const result = await arena.updateArenaStatus(arenaId, declinedReason, status);
        
        if (!result) {
            return res.status(404).json({ message: "Arena not found." });
        }

        return res.status(200).json({ message: "Arena status updated successfully." });
    } catch (error) {
        console.error("Error updating arena status:", error);
        res.status(500).json({ message: "Failed to update arena status." });
    }
};

exports.getPricingForNewArena = async (req, res) => {
    try {
        const results = await arena.getPricingForNewArena();
        
        if (results.length === 0) {
            return res.status(404).json({ message: "No pricing information found." });
        }

        return res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching pricing for new arena:", error);
        res.status(500).json({ message: "Failed to fetch pricing." });
    }
};

exports.getArenasForOwnerWithStatus = async (req, res) => {
    try {
        const ownerId = req.user.userId;

        const results = await arena.getArenasForOwnerWithStatus(ownerId);
        
        return res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching arenas for owner:", error);
        res.status(500).json({ message: "Failed to fetch arenas." });
    }
};