const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true }
});

// Virtual for item's URL
CategorySchema.virtual("url").get(function () {
  return `/categories/${this.name.toLowerCase()}`;
});

// Export model
module.exports = mongoose.model("Category", CategorySchema);
