var express = require('express');
var mongoose = require('mongoose');

var routes = function(Users, GameData) {
	var apiRouter = express.Router();
	
	apiRouter.route('/list-of-friends/:userId')
		.get(function(req, res) {
			
			GameData.findOne(
			{ 'user_id': req.params.userId },
			'user_id list_of_friends',
			function(err, user) {
				if (err) {
					res.status(500).send(err);
				} else if (user) {
					var o = user.list_of_friends;
					var fl = [];
					
					o.forEach(function(value) {
						fl.push(value.fbid);
					});
					
					Users.find(
						{ 'username.uid': { $in: fl }},
						'_id name username image status',
						function(err, users) {	
							if (err) {
								res.status(503).send(err);
							} else if (users) {
								var data = {};
								data.friends = users;
								res.status(200).send(data);
							} else {
								res.status(404).send('no friends found');
							}
						}
					);
					
				} else {
					res.status(400).send('user not found');
				}
			});
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
							'questions.prepared': {
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
							'questions.custom': o.question
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
									var length = user.questions.custom.length - 1;
							
									res.status(201).send(user.questions.custom[length]);
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