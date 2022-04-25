const mongoose = require('mongoose');

const VizSchema = new mongoose.Schema({
    name: String,
    visibleOnRouters: [String],
    lightSrc: String,
    darkSrc: String,
    height: String,
    width: String,
    countryFilter: Boolean
});

module.exports = VizSchema