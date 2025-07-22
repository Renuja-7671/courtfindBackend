const express = require("express");
const router = express.Router();
const courtController = require("../controllers/courtController");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/cloudinaryUpload");

//Routes to create new court
router.post("/upload-images", authenticateUser, authorizeRole(["Owner"]), upload.array("images"), courtController.uploadCourtImages);
router.post("/create", authenticateUser, authorizeRole(["Owner"]), courtController.createCourt);

router.get("/arenas/:arenaId/courts", authenticateUser, authorizeRole(["Owner"]), courtController.getCourtsByArena); // Get courts by arena
router.put("/:courtId", authenticateUser, authorizeRole(["Owner"]), courtController.updateCourtName); // Update court name
router.delete("/:courtId", authenticateUser, authorizeRole(["Owner"]), courtController.deleteCourt); // Delete court

module.exports = router;
