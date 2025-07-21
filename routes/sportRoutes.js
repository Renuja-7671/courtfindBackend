const express = require('express');
const router = express.Router();
const sportController = require('../controllers/sportController');
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

// Protect routes to ensure only Admins can access them
router.post('/sports', authenticateUser, authorizeRole(['Admin']), sportController.addSport);
router.put('/sports/:sportId', authenticateUser, authorizeRole(['Admin']), sportController.updateSport);
router.delete('/sports/:sportId', authenticateUser, authorizeRole(['Admin']), sportController.deleteSport);


router.get('/sports', sportController.getAllSports);
router.get('/sports/search', sportController.searchSports);
router.get('/sports/:sportId', sportController.getSportById);
router.get('/sports/name/:name', sportController.getSportByName);

module.exports = router;