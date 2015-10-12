var mongoose = require('mongoose');

var gameDataSchema = mongoose.Schema({
	lives: {
		current: Number,
		max: Number
	},
	coins: Number,
	powerups: {
		bombs: Number,
		change: Number,
		show: Number
	},
	questions: {
		prepared_questions: Array,
		custom_questions: Array
	},
	list_of_friends: Array,
	notifications: Array,
	challenges: {
		incoming: {
			pending: Array,
			completed: Array
		},
		outgoing: {
			pending: Array,
			completed: Array
		}
	},
	settings: {
		app_notifications_only: Boolean,
		game_sounds: Boolean
	},
	user_id: ObjectId
});

module.exports = mongoose.model('GameData', gameDataSchema, 'users_gdata');