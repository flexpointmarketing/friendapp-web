var express = require('express');

var routes = function(Statistics, QuizSets, GameData) {
	'use strict';
	
	var apiRouter = express.Router();

	var counter = function(cur, total) {
		return cur == total;
	}

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
		});
	
	apiRouter.route('/quiz-set/')
		.get(function(req, res) {
			QuizSets.findById(req.query.setId, function(err, quiz) {
				if (err) {
					res.status(503).send(err);
				} else if (quiz) {
					var data = {};
					
					data._id = quiz._id;
					data._stats_id = quiz.stats_id;	
					data.questions = [];
					data.extra = {};
					data.extra.prepared = [];
					data.extra.custom = [];
					
					GameData.findOne(
						{ 'user_id': req.query.senderId },
						'_id user_id questions',
						function(err, user) {
							if (err) {
								res.status(503).send(err);
							} else if (user) {
								var pq = user.questions.prepared,
									cq = user.questions.custom;
								
								quiz.questions.forEach(function(val, x) {
									var o = {};
									o.qid = val.qid;
									o.type = val.type;
									
									if (val.type == 'custom') {
										cq.every(function(a, b) {
											if (a.qid.toString() == val.qid.toString()) {
												
												o.question = a.question;
												o.answer = a.answer;
												o.options = a.options;
												data.questions.push(o);
												
												cq.splice(b, 1);
												
												return false;
											} else {
												return true;
											}
										});
										
									} else if (val.type == 'prepared') {								
										pq.every(function(a, b) {
										
											if (a.qid.toString() == val.qid.toString()) {
												
												o.answer = a.answer;
												data.questions.push(o);
	
												pq.splice(b, 1);
	
												return false;
											} else {
												return true;
											}
										});
										
									} else {
										console.log('no type');
									}
								});
								
								cq.forEach(function(val) {
									data.extra.custom.push(val);
								});
								
								pq.forEach(function(val) {
									data.extra.prepared.push(val);
								});
								
								res.status(200).send(data);
								
							} else {
								res.status(404).send('user not found');
							}
						}
					);
				} else {
					res.status(404).send('quiz set not found');
				}
			});
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
														if (a.stats_id.toString() == x._id.toString()) {
															iRet['sid'] = a._id;
															iRet['stats_id'] = x._id;
															iRet['sender'] = x.sender;
															
															user.challenges.incoming.every(function(p, q) {
																if (p.sid.toString() == a._id.toString()) {
																	iRet['status'] = p.status;
																	
																	return false;
																} else {
																	return true;
																}
															});
															
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
															
															user.challenges.outgoing.every(function(p, q) {
																if (p.sid.toString() == a._id.toString()) {
																	iRet['status'] = p.status;
																	
																	return false;
																} else {
																	return true;
																}
															});
															
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
		
	apiRouter.route('/statistics/:statId')
		.get(function(req, res) {
			Statistics.findById(req.params.statId, function(err, data) {
				if (err) {
					res.status(503).send(err);
				} else if (data) {
					res.status(200).send(data);
				} else {
					res.status(404).send('statistics not found');
				}
			});
		})
		.patch(function(req, res) {
			var o = req.body;
			
			var query = {
				'_id': req.params.statId,
				'receivers.rid': o.rid
			};
			
			var update = {
				$set: {
					'receivers.$.status': o.status,
					'receivers.$.powerups': o.powerups
				},
				$push: {
					'receivers.$.results': {
						$each: o.results
					}	
				}
			}
			
			Statistics.findOneAndUpdate(query, update, function(err, stat) {
				if (err) {
					res.status(503).send(err);
				} else if (stat) {
					var q = { 'user_id': o.rid, 'challenges.incoming.sid': o.set_id };
					var u = { $set: { 'challenges.incoming.$.status': 1 } };
					var q2 = { '_id': req.params.statId, 'receivers.status': 0 };
	
					GameData.findOneAndUpdate(q, u, function(err, data) {});
	
					Statistics.find(q2, function(err, items) {			
						if (err) {
							res.status(503).send(err);
						} else {					
							var q3 = { 'user_id': o.sender_id, 'challenges.outgoing.sid': o.set_id };
							var u3 = { $set: { 'challenges.outgoing.$.status': 1 }};
							
							if (items.length == 0) {
								GameData.findOneAndUpdate(q3, u3, function(err, data) {});	
							}
						}
					});
					
					res.status(201).send(stat);	
				} else {
					res.status(404).send('stat id not found');
				}
			});
		});
		
	return apiRouter;
}

module.exports = routes;