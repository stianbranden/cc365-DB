const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
    name: String,
    routerName: String,
    icon: String,
    params: [{
        key: String,
        value: String
    }]
});

module.exports = PageSchema