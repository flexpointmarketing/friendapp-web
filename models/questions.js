var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	
var model = new Schema({
	question: String,
	options: Array
});

module.exports = mongoose.model('Questions', model, 'questions');