var express = require('express');

var routes = function(Questions) {
	var router = express.Router();
	
	router.route('/prepared')
		.get(function(req, res) {
			Questions.find({}, function(err, questions) {
				if (err) {
					res.status(500).send(err);
				} else if (questions) {
					res.status(200).send({
						data: questions
					});
				}
			})
		});
	
	return router;
}

module.exports = routes;