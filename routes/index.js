const express = require('express');
const router = express.Router();
const pollutionReportController = require('../controllers/pollutionReportController');

router.get('/', pollutionReportController.getHomePage);
router.post('/api/reports', pollutionReportController.createReport);
router.get('/api/reports', pollutionReportController.getReports);

module.exports = router;
