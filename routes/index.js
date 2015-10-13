var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index.ejs', {});
});

router.post('/', function(req, res) {
    res.json({
        status: 200,
        data: {
            postVerb: 'success'
        }
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
