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

    court.create(courtData, (err, result) => {
        if (err) {
            console.error("Error inserting court:", err);
            return res.status(500).json({success: false, message: "Database Error while creating court"});
    }

    res.status(201).json({
        success: true,
        message: "Court created successfully",
        courtId: result.insertId
    });
    });

} catch (error) {
    console.error("Error creating court:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.uploadCourtImages = (req, res) => {
    try {
        if (!req.files ||req.files.length === 0) {
            return res.status(400).json({ success: false, message: "No images provided."});
        }
    //Normalize paths: forward slashes for URLs
    const imageUrls = req.files.map(file => {
        const relativePath = file.path.replace(/\\/g, "/");
        return relativePath.replace(/\/{2,}/g, "/")
    });

    //console.log("Uploaded image urls", imageUrls);
    res.json({ success: true, message: "Images uploaded successfully", imageUrls });
    }catch (error){
        console.error("Error uploading images:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

    exports.getCourtsForBooking = async (req, res) => {
    const { courtId } = req.params;
    if (!courtId) {
        return res.status(400).json({ success: false, message: "Court ID is required." });
    }
    try {
        court.getCourtsforbooking(courtId, (err, results) => {
            if (err) {
                console.error("Error fetching court for booking:", err);
                return res.status(500).json({ success: false, message: "Database Error while fetching court" });
            }
            if (results.length === 0) {
                return res.status(404).json({ success: false, message: "Court not found" });
            }
            res.json({ success: true, court: results[0] });
        });
    } catch (error) {
        console.error("Error in getCourtsForBooking:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }};

    // Delete Court
    exports.deleteCourt = (req, res) => {
    const courtId = req.params.courtId;
    
    court.deleteCourt(courtId, (err, result) => {
        if (err) {
            if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
            message: "Cannot delete court. It has existing bookings."
            });
        }
       // return res.status(500).json({ message: "Failed to delete court", error: err.message });
        }
        if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Court not found" });
        }
        res.status(200).json({ message: "Court deleted successfully" });
    });
    };

    // Get Courts by Arena
    exports.getCourtsByArena = (req, res) => {
    const arenaId = req.params.arenaId;
    
    court.getCourtsByArena(arenaId, (err, courts) => {
        if (err) {
        return res.status(500).json({ message: "Database Error", error: err.message });
        }
        res.status(200).json(courts);
    });
    };

    // Update Court Name
    exports.updateCourtName = (req, res) => {
    const courtId = req.params.courtId;
    const { name } = req.body;
    
    if (!name) {
        return res.status(400).json({ message: "Name is required" });
    }
    
    court.updateCourtName(courtId, name, (err, result) => {
        if (err) {
        return res.status(500).json({ message: "Database Error", error: err.message });
        }
        if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Court not found" });
        }
        res.status(200).json({ message: "Court updated successfully" });
    });
    };
    