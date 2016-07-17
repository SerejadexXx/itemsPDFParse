var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    collectionCode:    String,
    data:   Schema.Types.Mixed
});
var Collections = mongoose.model('Collections', schema);

module.exports = Collections;