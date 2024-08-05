var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CelOS', hiddenterminal: false, backend: process.env.BACKEND_URL});
});

module.exports = router;
