var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var bombsSchema = new Schema({
	qid: ObjectId
}, { _id: false });

var changedSchema = new Schema({
	oid: ObjectId,
	nid: ObjectId 
}, { _id: false });

var showSchema = new Schema({
	qid: ObjectId
}, { _id: false });
	
var receiversResultsSchema = new Schema({
	qid: ObjectId,
	answer: String,
	correct: Boolean
}, { _id: false });

var receiversSchema = new Schema({
	rid: ObjectId,
	status: {
		type: Number,
		default: 0
	},
	results: [ receiversResultsSchema ],
	powerups: {
		bombs: [ bombsSchema ],
		changed: [ changedSchema ],
		show: [ showSchema ] 
	}
}, { _id: false });

var model = new Schema({
	sender: ObjectId,
	receivers: [ receiversSchema ]
});

module.exports = mongoose.model('Statistics', model, 'statistics');