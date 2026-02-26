const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    area: { type: String, required: true }, // subject এর বদলে area দিন
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);