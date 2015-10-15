var express = require('express');

var routes = function(Questions, Users, GameData) {
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
	
	apiRouter.use('/:userId', function(req, res, next) {
		Users.findById(req.params.userId, function(err, user) {
			if (err) {
				res.status(500).send(err);
			} else if (user) {
				req.user = user;
				next();
			} else {
				res.status(400).send('user not found');
			}
		});
	});
	apiRouter.route('/:userId')
		.get(function(req, res) {
			var uid = req.user._id;
			
			GameData.findOne({ 'user_id': uid }, function(err, data) {
				if (err) {
					res.status(500).send(err);
				} else if (data) {
					res.status(200);
					res.send(data);
				} else {
					var gameData = new GameData();
					
					gameData.user_id = uid;
					gameData.save();
					res.status(201);
					res.send(gameData);
				}
			});
		});
	
	apiRouter.route('/app/prepared-questions')
		.post(function(req, res) {
			res.json({});
		});
	
	return apiRouter;
}

module.exports = routes;