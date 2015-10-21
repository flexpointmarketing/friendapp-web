var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	
var receiversResultsSchema = new Schema({
	qid: ObjectId,
	answer: String,
	correct: Boolean
}, { _id: false });

var receiversReplacedSchema = new Schema({
	oid: ObjectId,
	nid: ObjectId 
}, { _id: false });

var receiversSchema = new Schema({
	rid: ObjectId,
	status: {
		type: Number,
		default: 0
	},
	results: [ receiversResultsSchema ],
	replaced: [ receiversReplacedSchema ]
}, { _id: false });

var model = new Schema({
	sender: ObjectId,
	receivers: [ receiversSchema ]
});

module.exports = mongoose.model('Statistics', model, 'statistics');