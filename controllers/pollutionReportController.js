const PollutionReport = require('../models/PollutionReport');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

exports.createReport = [
  upload.single('image'),
  async (req, res) => {
    try {
      console.log('Received report data:', req.body);
      const { location, description } = req.body;
      const [latitude, longitude] = location.split(',').map(coord => parseFloat(coord.trim()));

      // Validate coordinates
      if (isNaN(latitude) || latitude < -90 || latitude > 90 ||
          isNaN(longitude) || longitude < -180 || longitude > 180) {
        return res.status(400).json({ error: 'Invalid coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180.' });
      }

      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const newReport = new PollutionReport({
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        description,
        imageUrl
      });
      await newReport.save();
      console.log('Report saved:', newReport);
      res.status(201).json(newReport);
    } catch (error) {
      console.error('Error creating pollution report:', error);
      res.status(500).json({ error: 'Error creating pollution report', details: error.message });
    }
  }
];

exports.getReports = async (req, res) => {
  try {
    const reports = await PollutionReport.find().sort('-createdAt').lean();
    res.json(reports);
  } catch (error) {
    console.error('Error fetching pollution reports:', error);
    res.status(500).json({ error: 'Error fetching pollution reports', details: error.message });
  }
};

exports.getHomePage = (req, res) => {
  res.render('index', { title: 'Pollution Tracker' });
};
