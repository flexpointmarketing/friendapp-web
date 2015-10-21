var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var pQuestionsSchema = new Schema({
	qid: ObjectId,
	answer: String
}, { _id: false });

var cQuestionsSchema = new Schema({
	qid: {
		type: ObjectId,
		default: mongoose.Types.ObjectId()
	},
	question: String,
	answer: String,
	options: Array
}, { _id: false });

var listOfFriendsSchema = new Schema({
	fbid: String,
	is_notify: Boolean
}, { _id: false });

var incomingChallengesSchema = new Schema({
	sid: ObjectId,
	status: {
		type: Number,
		default: 0
	}
}, { _id: false });

var outgoingChallengesSchema = new Schema({
	sid: ObjectId,
	status: {
		type: Number,
		default: 0
	}
}, { _id: false });

var gameDataSchema = new Schema({
	lives: {
		current: {
			type: Number,
			default: 5
		},
		max: {
			type: Number,
			default: 5
		}
	},
	coins: {
		type: Number,
		default: 0
	},
	powerups: {
		bombs: {
			type: Number,
			default: 0
		},
		change: {
			type: Number,
			default: 0
		},
		show: {
			type: Number,
			default: 0
		}
	},
	questions: {
		prepared: [ pQuestionsSchema ],
		custom: [ cQuestionsSchema ]
	},
	list_of_friends: [ listOfFriendsSchema ],
	notifications: [ ],
	challenges: {
		incoming: [ incomingChallengesSchema ],
		outgoing: [ outgoingChallengesSchema ]
	},
	settings: {
		app_notifications_only: {
			type: Boolean,
			default: true
		},
		game_sounds: {
			type: Boolean,
			default: true
		}
	},
	user_id: ObjectId
});

module.exports = mongoose.model('GameData', gameDataSchema, 'users_gdata');