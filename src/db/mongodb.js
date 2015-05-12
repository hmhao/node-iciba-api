// DB Connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/vocabulary');
exports.mongoose = mongoose;