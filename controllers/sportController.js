const Sport = require("../models/sportModel");

exports.getAllSports = async (req, res) => {
    try {
        Sport.getAllSports((err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "No sports found" });
            }
            console.log("All sports:", results); // Debugging line
            res.json(results);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
        Sport.searchSports(sport, (err, results) => {
            if (err) {
                console.error("Database error:", err);
                // Log the error for debugging
                console.error("Error details:", err); // Debugging line
                return res.status(500).json({ error: "Database error" });
            }
            if (results.length === 0) {
                console.log("No sports found for the given filters."); // Debugging line
                return res.status(404).json({ message: "No sports found" });
            }
            console.log("Search results:", results); // Debugging line
            res.json(results);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSportById = async (req, res) => {
    const sportId = req.params.sportId;
    try {
        Sport.getSportById(sportId, (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Sport not found" });
            }
            console.log("Sport details:", results); // Debugging line
            res.json(results[0]);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addSport = async (req, res) => {
    const sport = req.body;
    try {
        Sport.addSport(sport, (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            console.log("Sport added:", results); // Debugging line
            res.status(201).json(results[0]);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSport = async (req, res) => {
    const sportId = req.params.sportId;
    const sport = req.body;
    //console.log("Sport ID:", sportId); // Debugging line
    //console.log("Sport data to update:", sport); // Debugging line
    try {
        Sport.updateSport(sportId, sport, (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Sport not found" });
            }
            console.log("Sport updated:", results); // Debugging line
            res.json(results[0]);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteSport = async (req, res) => {
    const sportId = req.params.sportId;
    try {
        Sport.deleteSport(sportId, (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Sport not found" });
            }
            console.log("Sport deleted:", results); // Debugging line
            res.status(204).send();
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSportByName = async (req, res) => {
    const name = req.params.name;
    try {
        Sport.getSportByName(name, (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Sport not found" });
            }
            console.log("Sport details:", results); // Debugging line
            res.json(results[0]);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSportByType = async (req, res) => {
    const type = req.params.type;
    try {
        Sport.getSportByType(type, (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Sport not found" });
            }
            //console.log("Sport details:", results); // Debugging line
            res.json(results[0]);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSportByNoOfPlayer = async (req, res) => {
    const noOfPlayer = req.params.noOfPlayer;
    try {
        Sport.getSportByNoOfPlayer(noOfPlayer, (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "Sport not found" });
            }
            //console.log("Sport details:", results); // Debugging line
            res.json(results[0]);
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


