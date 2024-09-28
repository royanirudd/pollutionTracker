const mongoose = require('mongoose');

const pollutionReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
    required: false
  },
  imageUrl: {
    type: String
  }
}, { timestamps: true });

pollutionReportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('PollutionReport', pollutionReportSchema);
