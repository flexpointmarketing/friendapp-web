var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
	
var model = new Schema({
	sender: ObjectId,
	receivers: [{
		rid: ObjectId,
		status: Number,
		results: [{
			qid: ObjectId,
			answer: String,
			correct: Boolean
		}],
		replaced: [{
			from: ObjectId,
			to: ObjectId
		}]
	}]
});

module.exports = mongoose.model('Statistics', model, 'statistics');