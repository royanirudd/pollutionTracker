const PollutionReport = require('../models/pollutionReport');
const User = require('../models/user');  // Add this line to import the User model

exports.getLandingPage = (req, res) => {
  res.render('landing', { title: 'Pollution Tracker' });
};

exports.getAppPage = (req, res) => {
  res.render('index', { title: 'Pollution Tracker', user: req.user });
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

    if (!req.user) {
      return res.status(401).json({ error: 'User must be authenticated to create a report' });
    }

    // Find the user in the database
    const user = await User.findOne({ 
      $or: [
        { googleId: req.user.googleId },
        { githubId: req.user.githubId }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found in the database' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const newReport = new PollutionReport({
      user: user._id,  // Use the user's ObjectId from the database
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
    if (!req.user) {
      return res.status(401).json({ error: 'User must be authenticated to view reports' });
    }

    // Find the user in the database
    const user = await User.findOne({ 
      $or: [
        { googleId: req.user.googleId },
        { githubId: req.user.githubId }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found in the database' });
    }

    const reports = await PollutionReport.find({ user: user._id })
      .sort('-createdAt')
      .lean();
    res.json(reports);
  } catch (error) {
    console.error('Error fetching pollution reports:', error);
    res.status(500).json({ error: 'Error fetching pollution reports', details: error.message });
  }
};

exports.getHomePage = (req, res) => {
  res.render('index', { title: 'Pollution Tracker', user: req.user });
};
