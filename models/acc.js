const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accSchema = new Schema({
    token: {
        type: String,
        required: true
    } 
}, { timestamps: true });

const Account = mongoose.model('Account', accSchema);

module.exports = Account;