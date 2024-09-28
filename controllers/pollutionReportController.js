const PollutionReport = require('../models/PollutionReport');

exports.createReport = async (req, res) => {
  try {
    const { latitude, longitude, description, imageUrl } = req.body;
    const newReport = new PollutionReport({
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      description,
      imageUrl
    });
    await newReport.save();
    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating pollution report:', error);
    res.status(500).json({ error: 'Error creating pollution report' });
  }
};

exports.getHomePage = (req, res) => {
  res.render('index', { title: 'Pollution Tracker' });
};
