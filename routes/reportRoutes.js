const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

router.get('/arena-revenue', authenticateUser, authorizeRole(["Owner"]), reportController.downloadArenaRevenueReport);


module.exports = router;
