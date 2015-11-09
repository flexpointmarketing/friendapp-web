var express = require('express');

var routes = function(Users) {
    var router = express.Router();
    
    router.route('/')
        .get(function(req, res) {
            res.render('index', {});
        })
        .post(function(req ,res) {
            res.render('index', {});
        });
   
    return router;
}

module.exports = routes;
