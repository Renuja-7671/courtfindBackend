const Sport = require("../models/sportModel");

exports.getAllSports = async (req, res) => {
    try {
        const results = await Sport.getAllSports();
        
        if (results.length === 0) {
            return res.status(404).json({ message: "No sports found" });
        }
        console.log("All sports:", results); // Debugging line
        res.json(results);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
};

exports.searchSports = async (req, res) => {
    const { sport } = req.query;
    console.log("Filters in controller:", req.query); // Debugging line
    console.log("Sport:", sport); // Debugging line
    
    if (!sport) {
        return res.status(400).json({ error: "At least one filter (sport) is required." });
    }
    
    try {
        const results = await Sport.searchSports(sport);
        
        if (results.length === 0) {
            console.log("No sports found for the given filters."); // Debugging line
            return res.status(404).json({ message: "No sports found" });
        }
        console.log("Search results:", results); // Debugging line
        res.json(results);
    } catch (err) {
        console.error("Database error:", err);
        console.error("Error details:", err); // Debugging line
        res.status(500).json({ error: "Database error" });
    }
};

exports.getSportById = async (req, res) => {
    const sportId = req.params.sportId;
    try {
        const result = await Sport.getSportById(sportId);
        
        if (!result) {
            return res.status(404).json({ message: "Sport not found" });
        }
        console.log("Sport details:", result); // Debugging line
        res.json(result);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
};

exports.addSport = async (req, res) => {
    const sport = req.body;
    try {
        const result = await Sport.addSport(sport);
        
        console.log("Sport added:", result); // Debugging line
        res.status(201).json(result);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
};

exports.updateSport = async (req, res) => {
    const sportId = req.params.sportId;
    const sport = req.body;
    //console.log("Sport ID:", sportId); // Debugging line
    //console.log("Sport data to update:", sport); // Debugging line
    
    try {
        const result = await Sport.updateSport(sportId, sport);
        
        if (!result) {
            return res.status(404).json({ message: "Sport not found" });
        }
        console.log("Sport updated:", result); // Debugging line
        res.json(result);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
};

exports.deleteSport = async (req, res) => {
    const sportId = req.params.sportId;
    try {
        const result = await Sport.deleteSport(sportId);
        
        if (!result) {
            return res.status(404).json({ message: "Sport not found" });
        }
        console.log("Sport deleted:", result); // Debugging line
        res.status(204).send();
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
};

exports.getSportByName = async (req, res) => {
    const name = req.params.name;
    try {
        const result = await Sport.getSportByName(name);
        
        if (!result) {
            return res.status(404).json({ message: "Sport not found" });
        }
        console.log("Sport details:", result); // Debugging line
        res.json(result);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
};

exports.getSportByType = async (req, res) => {
    const type = req.params.type;
    try {
        const results = await Sport.getSportByType(type);
        
        if (results.length === 0) {
            return res.status(404).json({ message: "Sport not found" });
        }
        //console.log("Sport details:", results); // Debugging line
        res.json(results);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
};

exports.getSportByNoOfPlayer = async (req, res) => {
    const noOfPlayer = req.params.noOfPlayer;
    try {
        const results = await Sport.getSportByNoOfPlayer(noOfPlayer);
        
        if (results.length === 0) {
            return res.status(404).json({ message: "Sport not found" });
        }
        //console.log("Sport details:", results); // Debugging line
        res.json(results);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
};