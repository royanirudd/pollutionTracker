const mongoose = require('mongoose');

const pollutionReportSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  }
}, { timestamps: true });

pollutionReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('PollutionReport', pollutionReportSchema);
