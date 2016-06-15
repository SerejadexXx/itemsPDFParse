var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    accessCode:    String,
    data:   Schema.Types.Mixed
});
var Info = mongoose.model('Info', schema);

module.exports = Info;