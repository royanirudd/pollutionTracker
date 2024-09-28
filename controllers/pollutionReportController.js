const PollutionReport = require('../models/pollutionReport');

exports.getLandingPage = (req, res) => {
  res.render('landing', { title: 'Pollution Tracker' });
};

exports.getAppPage = (req, res) => {
  res.render('index', { title: 'Pollution Tracker' });
};

exports.createReport = async (req, res) => {
  try {
    console.log('Received report data:', req.body);
    console.log('Received file:', req.file);

    const { location, description } = req.body;
    console.log('Extracted location:', location);
    console.log('Extracted description:', description);

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    let coordinates;
    if (location.includes(',')) {
      coordinates = location.split(',').map(coord => parseFloat(coord.trim()));
      if (coordinates.length !== 2 || isNaN(coordinates[0]) || isNaN(coordinates[1])) {
        return res.status(400).json({ error: 'Invalid location format. Please provide latitude and longitude separated by a comma.' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid location format. Please provide latitude and longitude separated by a comma.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const newReport = new PollutionReport({
      location: {
        type: 'Point',
        coordinates: [coordinates[1], coordinates[0]] // GeoJSON format is [longitude, latitude]
      },
      description: description || '',
      imageUrl
    });

    const savedReport = await newReport.save();
    res.status(201).json(savedReport);

  } catch (error) {
    console.error('Error creating pollution report:', error);
    res.status(500).json({ error: 'Error creating pollution report', details: error.message });
  }
};

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
