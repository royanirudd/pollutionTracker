const PollutionReport = require('../models/pollutionReport');

exports.createReport = async (req, res) => {
  try {
    console.log('Received report data:', req.body);
    console.log('Received file:', req.file);

    const { location, description } = req.body;
    console.log('Extracted location:', location);
    console.log('Extracted description:', description);
    let coordinates;

    if (location && location.includes(',')) {
      // If location is provided as "latitude,longitude"
      coordinates = location.split(',').map(coord => parseFloat(coord.trim()));
    } else {
      // If location is not provided or is in an invalid format
      // You might want to use a geocoding service here to convert it to coordinates
      // For now, we'll just use a placeholder
      coordinates = [0, 0];
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newReport = new PollutionReport({
      location: {
        type: 'Point',
        coordinates: [coordinates[1], coordinates[0]] // GeoJSON format is [longitude, latitude]
      },
      description,
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
