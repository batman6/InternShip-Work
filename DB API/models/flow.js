var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FlowSchema = new Schema({
    id: Number,
    label: String,
    group: String
},{collection: 'OnboardFlow'});

module.exports = mongoose.model('Flow',FlowSchema);