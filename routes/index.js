const express = require('express');
const router = express.Router();
const pollutionReportController = require('../controllers/pollutionReportController');

router.get('/', pollutionReportController.getHomePage);
router.post('/api/reports', pollutionReportController.createReport);

module.exports = router;
