const express = require('express');
const router = express.Router();
const arenaController = require('../controllers/arenaController');
const { authenticateUser, authorizeRole } = require('../middleware/authMiddleware');
const { uploadArenas } = require("../middleware/uploadMiddleware");
const { route } = require('./authRoutes');
const sportController = require('../controllers/sportController');

router.get('/', arenaController.getAllArenas); // Get all arenas
router.get('/search', arenaController.searchArenas); // Search arenas based on filters
router.post('/', authenticateUser, authorizeRole(["Owner"]), arenaController.addArena); //Add a new arena
router.post('/upload', authenticateUser, authorizeRole(["Owner"]), uploadArenas.single('image'), arenaController.uploadArenaImage); //Add an image for arena
router.get("/sports", authenticateUser, authorizeRole(["Owner"]), sportController.getAllSports);

router.get('/owner', authenticateUser, authorizeRole(["Owner"]), arenaController.getArenasByOwner);
router.put("/:arenaId", authenticateUser, authorizeRole(["Owner"]), arenaController.updateArenaName);
router.delete("/:arenaId", authenticateUser, authorizeRole(["Owner"]), arenaController.deleteArena);

router.get('/pending-by-owner', authenticateUser, authorizeRole(["Owner"]), arenaController.getPendingArenas); // Get arenas with status pending
router.get('/pending-for-admin', authenticateUser, authorizeRole(["Admin"]), arenaController.getPendingArenasForAdmin); // Get arenas with status pending
router.put('/update-status/:arenaId', authenticateUser, authorizeRole(["Admin"]), arenaController.updateArenaStatus); // Approve arena
router.get('/price-for-new-arena-by-owner', authenticateUser, authorizeRole(["Owner"]), arenaController.getPricingForNewArena); // Get price for new arena addition
router.get('/get-arenas-with-arenaStatus', authenticateUser, authorizeRole(["Owner"]), arenaController.getArenasForOwnerWithStatus); // Get arenas with arenaStatus

module.exports = router;