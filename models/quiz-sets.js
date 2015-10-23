var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var questionsSchema = new Schema({
	qid: ObjectId,
	type: {
		type: String
	}
}, { _id: false });

var model = new Schema({
	questions: [ questionsSchema ],
	stats_id: ObjectId
});

module.exports = mongoose.model('QuizSets', model, 'quiz_sets');