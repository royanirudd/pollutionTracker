const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pollutionReportController = require('../controllers/pollutionReportController');

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/') // make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
  }
});

const upload = multer({ storage: storage });

router.get('/', pollutionReportController.getLandingPage);
router.get('/app', pollutionReportController.getAppPage);
router.post('/api/reports', upload.single('image'), pollutionReportController.createReport);
router.get('/api/reports', pollutionReportController.getReports);

module.exports = router;
