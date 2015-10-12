var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  // res.render('index', { title: 'Friend App' });
    res.json({
        status: 200,
        data: {
            getVerb: 'success'
        }
    });
});

router.post('/', function(req, res) {
   res.json({
      status: 200,
      data: {}
   });
});

router.patch('/', function(req, res) {
   res.json({
       status: 200,
       data: {
           patch: 'success'
       } 
   });
});

router.delete('/', function(req, res) {
    res.json({
        status: 200,
        data: {
            deleteVerb: 'success'
        }
    }) 
});

module.exports = router;
