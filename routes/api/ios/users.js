var express = require('express');

var routes = function(Users, GameData) {
	var apiRouter = express.Router();
	
	apiRouter.route('/')
		.post(function(req, res) {
			var userParse = req.body; 
			var fbUid = userParse.username.uid;
			
			Users.findOne({ 'username.uid': fbUid }, function(err, user) {
				if (err) {
					res.status(500).send(err);
				} else if (user) {
					
					res.status(200);
					res.send(user);
				} else {
					var nUser = new Users(req.body);
					
					nUser.save();
					res.status(201);
					res.send(nUser);
				}
			});
		});
	
	return apiRouter;
}

module.exports = routes;