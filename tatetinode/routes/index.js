var express = require('express');
var router = express.Router();

router.use('/lobbies', require('./lobbies.js'));
router.use('/players', require('./players.js'));

module.exports = router;
