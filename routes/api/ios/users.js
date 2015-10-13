var express = require('express');

var routes = function(Users) {
	var apiRouter = express.Router();
	
	apiRouter.route('/')
		.get(function(req, res) {
			
		})
		.post(function(req, res) {
			var user = new Users(req.body);
			
			console.log(req.body);
			console.log('---------------------');
			console.log(user);
			
			user.save();
			res.status(201);
			res.send(user);
		})
		.patch(function(req, res) {
			
		})
		delete(function(req, res) {
			
		});
	
	return apiRouter;
}

module.exports = routes;