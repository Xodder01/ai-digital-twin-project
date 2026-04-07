const mongoose = require('mongoose');

const predictionHistorySchema = new mongoose.Schema({
  user_email: {
    type: String,
    required: true,
    index: true,
    lowercase: true
  },
  type: {
    type: String,
    enum: ['predict', 'simulate'],
    required: true
  },
  inputs: {
    sleep_hours:       { type: Number },
    study_hours:       { type: Number },
    screen_time_hours: { type: Number },
    stress_level:      { type: Number }
  },
  outputs: {
    productivity_score: { type: Number },
    burnout_risk:       { type: Number },
    exam_score:         { type: Number },
    focus_index:        { type: Number },
    goal_probability:   { type: Number },
    ai_advice:          { type: String }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PredictionHistory', predictionHistorySchema);
