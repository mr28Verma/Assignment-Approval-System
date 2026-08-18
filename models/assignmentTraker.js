const mongoose = require('mongoose');

const trackerSchema = new mongoose.Schema({

  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "assignment",
    required: true
  },

  studentEmail: {
    type: String,
    required: true
  },

  currentStatus: {
    type: String,
    enum: [
      "draft",
      "submitted",
      "rejected",
      "resubmitted",
      "forwarded",
      "approved"
    ],
    default: "draft"
  },

  history: [
    {
      status: {
        type: String,
        enum: [
          "draft",
          "submitted",
          "rejected",
          "resubmitted",
          "forwarded",
          "approved"
        ],
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      updatedBy: {
        type: String,
        required: true
      }
    }
  ]

});

const tracker = mongoose.model("assignmentTracker", trackerSchema);

module.exports = tracker;
