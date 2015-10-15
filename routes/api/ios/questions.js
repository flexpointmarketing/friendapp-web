var express = require('express');

var routes = function(Questions) {
	var apiRouter = express.Router();

	apiRouter.route('/prepared')
		.get(function(req, res) {
			Questions.find({}, function(err, questions) {
				if (err) {
					res.status(500).send(err);
				} else if (questions) {
					res.status(200);
					res.send(questions);
				}
			})
		})
		.post(function(req, res) {		
			var questions = new Questions(req.body);
			
			questions.save();
			res.status(201);
			res.send(questions);
		});
	
	return apiRouter;
}

module.exports = routes;