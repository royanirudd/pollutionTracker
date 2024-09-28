const PollutionReport = require('../models/pollutionReport');

exports.createReport = async (req, res) => {
  try {
    console.log('Received report data:', req.body);
    console.log('Received file:', req.file);

    const { location, description } = req.body;
    console.log('Extracted location:', location);
    console.log('Extracted description:', description);
    let coordinates;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    if (location.includes(',')) {
      // If location is provided as "latitude,longitude"
      coordinates = location.split(',').map(coord => parseFloat(coord.trim()));
    } else {
      // If location is in an invalid format
      // You might want to use a geocoding service here to convert it to coordinates
      // For now, we'll just return an error
      return res.status(400).json({ error: 'Invalid location format' });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const newReport = new PollutionReport({
      location: {
        type: 'Point',
        coordinates: [coordinates[1], coordinates[0]] // GeoJSON format is [longitude, latitude]
      },
      description: description || '', // Use empty string if description is not provided
      imageUrl
    });

    await newReport.save();
    res.status(201).json(newReport);
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
