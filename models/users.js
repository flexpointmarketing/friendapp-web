var mongoose = require('mongoose');

var usersSchema = mongoose.Schema({
	name: {
		first: String,
		last: String
	},
	username: {
		email: String,
		uid: String,
		type: { type: String }
	},
	image: {
		original: String,
		thumb: String
	},
	status: Number,
	logins: Array
});

module.exports = mongoose.model('Users', usersSchema, 'users');