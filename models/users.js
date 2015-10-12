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
	logins: [{
		at: Date,
		duration: Number,
		location: {
			city: String,
			state: String,
			country: String,
			zip_code: String
		},
		platform: {
			name: String,
			type: {
				type: String
			}
		}
	}]
});

module.exports = mongoose.model('Users', usersSchema);