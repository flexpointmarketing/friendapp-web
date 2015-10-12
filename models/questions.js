var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
	
var model = new Schema({
	question: String,
	options: Array
});

module.exports = mongoose.model('Questions', model, 'questions');