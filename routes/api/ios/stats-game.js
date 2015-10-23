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
						
						console.log(sets);
						
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
		});
	
	apiRouter.route('/quiz-sets/:userId')
		.get(function(req, res) {
			var oData = {};
			
			if (req.params.userId) {
				GameData.findOne(
					{ 'user_id': req.params.userId },
					'user_id challenges',
					function(err, user) {
						if (err) {
							res.status(503).send(err);
						} else if (user) {
							var iArr = [],
								oArr = [];
								
							var oRetData = {};
							oRetData.uid = user._id;
							oRetData.sets = {};
							oRetData.sets.incoming = [];
							oRetData.sets.outgoing = [];
							
							oData.sets = {};
							oData.sets.incoming = [];
							oData.sets.outgoing = [];
							
							user.challenges.incoming.forEach(function(value, index) {
								iArr.push(value.sid.toString());
							});
							
							user.challenges.outgoing.forEach(function(value, index) {
								oArr.push(value.sid.toString());
							});
							
							var qSets = iArr.concat(oArr);
							
							QuizSets.find(
								{ '_id': { $in: qSets } },
								'_id questions stats_id data',
								function(err, sets) {
									var sArr = [];
									
									if (err) {
										res.status(503).send(err);
									} else {
										sets.forEach(function(value, index) {
											var sid = value._id.toString();
											
											if (iArr.indexOf(sid) != -1) {
												oData.sets.incoming.push(value);
											} else if (oArr.indexOf(sid) !== -1) {
												oData.sets.outgoing.push(value);
											}
											
											sArr.push(value.stats_id.toString());
										});
										
										Statistics.find(
											{ '_id': { $in: sArr} },
											function(err, stats) {										
												var iRet = {};
												var oRet = {};
												
												oData.sets.incoming.forEach(function(a, b) {
													stats.forEach(function(x, y) {
														console.log(x._id);
														if (a.stats_id.toString() == x._id.toString()) {
															iRet['sid'] = a._id;
															iRet['stats_id'] = x._id;
															iRet['sender'] = x.sender;
															
															oRetData.sets.incoming.push(iRet);
															iRet = {};
														}
													});
												});
												
												oData.sets.outgoing.forEach(function(a, b) {
													stats.forEach(function(x, y) {
														if (a.stats_id.toString() == x._id.toString()) {
															oRet['sid'] = a._id;
															oRet['stats_id'] = x._id;
															oRet['receivers'] = x.receivers;
															
															oRetData.sets.outgoing.push(oRet);
															oRet = {};
														}
													});
												});
												
												res.status(200).send(oRetData);
											}
										);
									}
								}
							);
							
						} else {
							res.status(404).send('user not found');
						}
					}
				)
			}
		});
	
	apiRouter.route('/quiz-sets/outgoing/:userId')
		.get(function(req, res) {
			
		});
		
	return apiRouter;
}

module.exports = routes;