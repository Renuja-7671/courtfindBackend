const court = require("../models/courtModel");

//Add new Court
exports.createCourt = async (req, res) => {
    try {
        const {
            name,
            size,
            rate,
            sport,
            otherSport,
            images,
            availability,
            arenaId,
        } = req.body;

        //Basic Validation
        if (!name || !size || !rate || (!sport && !otherSport) || !arenaId){
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const courtData = {
            name,
            size,
            rate,
            sport: otherSport || sport,
            images,
            availability,
            arenaId,
        };

        const result = await court.create(courtData);

        res.status(201).json({
            success: true,
            message: "Court created successfully",
            courtId: result.courtId
        });

    } catch (error) {
        console.error("Error creating court:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.uploadCourtImages = (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "No images provided." });
        }

        // Normalize paths and prepare array of URLs
        const imageUrls = req.files.map(file => {
            const relativePath = file.path.replace(/\\/g, "/");
            return relativePath.replace(/\/{2,}/g, "/");
        });

        res.status(200).json({
            success: true,
            message: "Images uploaded successfully",
            imageUrls
        });

    } catch (error) {
        console.error("Error uploading images:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.getCourtsForBooking = async (req, res) => {
    try {
        const { courtId } = req.params;
        if (!courtId) {
            return res.status(400).json({ success: false, message: "Court ID is required." });
        }

        const result = await court.getCourtsforbooking(courtId);
        
        if (!result) {
            return res.status(404).json({ success: false, message: "Court not found" });
        }
        
        res.json({ success: true, court: result });
    } catch (error) {
        console.error("Error in getCourtsForBooking:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Delete Court
exports.deleteCourt = async (req, res) => {
    try {
        const courtId = req.params.courtId;
        
        const result = await court.deleteCourt(courtId);
        
        if (!result) {
            return res.status(404).json({ message: "Court not found" });
        }
        
        res.status(200).json({ message: "Court deleted successfully" });
    } catch (error) {
        console.error("Error deleting court:", error);
        
        if (error.code === 'P2003') {
            return res.status(400).json({
                message: "Cannot delete court. It has existing bookings."
            });
        }
        
        res.status(500).json({ message: "Failed to delete court", error: error.message });
    }
};

// Get Courts by Arena
exports.getCourtsByArena = async (req, res) => {
    try {
        const arenaId = req.params.arenaId;
        
        const courts = await court.getCourtsByArena(arenaId);
        res.status(200).json(courts);
    } catch (error) {
        console.error("Error getting courts by arena:", error);
        res.status(500).json({ message: "Database Error", error: error.message });
    }
};

// Update Court Name
exports.updateCourtName = async (req, res) => {
    try {
        const courtId = req.params.courtId;
        const { name } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }
        
        const result = await court.updateCourtName(courtId, name);
        
        if (!result) {
            return res.status(404).json({ message: "Court not found" });
        }
        
        res.status(200).json({ message: "Court updated successfully" });
    } catch (error) {
        console.error("Error updating court name:", error);
        res.status(500).json({ message: "Database Error", error: error.message });
    }
};