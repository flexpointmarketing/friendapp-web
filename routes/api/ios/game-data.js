var express = require('express');
var mongoose = require('mongoose');

var routes = function(Questions, Users, GameData) {
	var apiRouter = express.Router();
		
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

	apiRouter.route('/questions/prepared')
		.patch(function(req, res) {
			var o = req.body;
			
			GameData.findOne({ "user_id": o.uid }, function(err, user) {
				if (err) {
					res.status(500).send(err);
				} else if (user) {
					
					GameData.update({
						'user_id': o.uid },
					{
						$push: {
							'questions.prepared_questions': {
								$each: o.questions
							}
						}
					},
					function(err) {
						if (err) {
							res.status(503).send(err);
						} else {
							res.status(201).send(o.questions);	
						}
					});
				} else {
					res.status(404).send('user not found');
				}
			});
		});
	
	apiRouter.route('/questions/custom')
		.patch(function(req, res) {
			var o = req.body;

			GameData.findOne({ "user_id": o.uid }, function(err, user) {
				if (err) {
					res.status(500).send(err);
				} else if (user) {
					
					GameData.update({
						'user_id': o.uid },
					{
						$push: {
							'questions.custom_questions': o.question
						}
					},
					function(err) {
						if (err) {
							res.status(503).send(err);
						} else {
							GameData.findOne({ 'user_id': o.uid }, function(err, user) {
								if (err) {
									res.status(503).send(err);
								} else if (user) {
									var length = user.questions.custom_questions.length - 1;
							
									res.status(201).send(user.questions.custom_questions[length]);
								} else {
									res.status(404).send('user not found');
								}
							})	
						}
					});
				} else {
					res.status(404).send('user not found')
				}
			});
		});
	
	return apiRouter;
}

module.exports = routes;