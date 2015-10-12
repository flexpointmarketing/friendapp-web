var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
	
var model = new Schema({
	questions: Array,
	stat_id: ObjectId
});

module.exports = mongoose.model('QuizSets', model, 'quiz_sets');