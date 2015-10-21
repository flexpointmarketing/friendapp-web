var express = require('express');

var routes = function(Statistics, QuizSets, GameData) {
	var apiRouter = express.Router();

	apiRouter.route('/')
		.post(function(req, res) {
			if (req.body) {
				var o = req.body;
				
				// save statistics
				var stats = new Statistics(o.stats);
				stats.save(function(err) {
					if (!err) {
						var sets = {};
						sets.questions = o.questions;
						sets.stats_id = stats._id;
						
						// save quiz sets
						var qsets = new QuizSets(sets);
						qsets.save(function(err) {
							if (!err) {
								var x = {};
								x.sid = qsets._id;
								
								// update sender outgoing
								GameData.update(
									{ 'user_id': o.stats.sender },
									{ $push: { 'challenges.outgoing': x } },
									function(err) {
										// update receivers incoming
										o.stats.receivers.forEach(function(value) {
											GameData.update(
												{ 'user_id': value.rid },
												{ $push: { 'challenges.incoming': x } },
												function(err) {}
											);
										});
										
										res.status(200).send('challenge sent');
									}
								);
								
							} else {
								res.status(503).send(err);
							}
						});
					} else {
						res.status(503).send(err);
					}
				});
		
			} else {
				res.status(404).send('no request found');
			}
		})
	
	return apiRouter;
}

module.exports = routes;