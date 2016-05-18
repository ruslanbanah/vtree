var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var NodeSchema   = new Schema({
  name: String,
  icon: String,
  href: String,
  isOpen: String,
  parent: String
});

module.exports = mongoose.model('Node', NodeSchema);