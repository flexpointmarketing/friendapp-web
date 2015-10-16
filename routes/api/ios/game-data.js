var express = require('express');
var mongoose = require('mongoose');

var routes = function(GameData) {
	var apiRouter = express.Router();

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
					res.status(404).send('user not found')
				}
			});
		});
	
	apiRouter.route('/questions/custom')
		.patch(function(req, res) {
			var o = req.body;
			
			console.log(o);
			
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