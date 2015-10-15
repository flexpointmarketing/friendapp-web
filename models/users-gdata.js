var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	
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
		prepared_questions: {
			type: Array,
			default: []
		},
		custom_questions: {
			type: Array,
			default: []
		}
	},
	list_of_friends: {
		type: Array,
		default: []
	},
	notifications: {
		type: Array,
		default: []
	},
	challenges: {
		incoming: {
			pending: {
				type: Array,
				default: []
			},
			completed: {
				type: Array,
				default: []
			}
		},
		outgoing: {
			pending: {
				type: Array,
				default: []
			},
			completed: {
				type: Array,
				default: []
			}
		}
	},
	settings: {
		app_notifications_only: {
			type: Boolean,
			default: 1
		},
		game_sounds: {
			type: Boolean,
			default: 1
		}
	},
	user_id: ObjectId
});

module.exports = mongoose.model('GameData', gameDataSchema, 'users_gdata');