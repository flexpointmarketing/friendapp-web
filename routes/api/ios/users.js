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
		})
		.post(function(req, res) {
			var o = req.body;
			o.uid = req.user._id;
			
			GameData.findOne({ 'user_id': o.uid }, function(err, user) {
				if (err) {
					res.status(500).send(err);
				} else if (user) {
					// add new friends
					GameData.update(
					{ 'user_id': o.uid },
					{ 'list_of_friends': o.friends },
					function(err) {
						if (err) {
							res.status(503).send(err);
						} else {
							// refetch user data
							GameData.findOne({ 'user_id': o.uid }, function(err, user) {
								if (err) {
									res.status(503).send(err);
								} else if (user) {
									res.status(200);
									res.send(user);	
								} else {
									res.status(404).send('user not found');
								}
							});
						}
					});
				} else {
					res.status(404).send('user not found');
				}
			});
		})
		.patch(function(req, res) {
			var o = req.body;
			o.uid = req.user.username.uid;
			
			o.friends.forEach(function(value) {
				Users.findOne({ 'username.uid': value }, '_id', function(err, user){
					if (user) {
						var x = {};
						x.fbid = o.uid;
						x.is_notify = true;
						
						GameData.update({
							'user_id': user._id	
						}, {
							$push: {
								'list_of_friends': x
							}
						}, function(err){});
					}
				});
			});
			
			res.status(200).send('success');
		});
	
	return apiRouter;
}

module.exports = routes;