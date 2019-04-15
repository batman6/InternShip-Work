var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EdgeSchema = new Schema({
    id: Number,
    from: String,
    from_node: String,
    to: String,
    to_node: String,
    label: String,
    level: Number
},{collection: 'Edges'});

module.exports = mongoose.model('Edge',EdgeSchema);