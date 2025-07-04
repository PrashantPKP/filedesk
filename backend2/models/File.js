const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  name: String,
  type: String,
  folder: String,
  tags: [String],
  read: Boolean,
  url: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("File", fileSchema);
