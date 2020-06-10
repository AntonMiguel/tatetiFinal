var express = require('express');
var router = express.Router();
var redis = require ('redis');
const redisClient = redis.createClient();
const {v4: uuidv4} = require ('uuid');
const Player = require('../models/player');

//CREATE PLAYER
//input needed: playerName
//output: playerId, token
router.post('/', async function(req, res, next){
  // Esta validacion podrias pasarla al modelo Player
  // entonces podiras hacer algo tipo:
  // player = new Player(req.body)
  // y luego podrias hacer un player.valid?
  // y lo que podes hacer es definir un atributo dentro de players
  // que era errors, entonces cuando haces el valid, metes los errores
  // que correspondan al errors y devolver true o false
  if (req.body.playerName.length <= 3 ||
      req.body.playerName.length >= 26 ||
      !(/^[A-Za-z0-9_]+$/.test(req.body.playerName))) {
    res.status(400).json(
      { status: 'error',
        response:{ error: 'inappropriate_playerName' } }
    );
    console.log('inappropriate_playerName');
  } else {
    let playerId = await Player.nextId();
    Player.setId(playerId);
    const token = uuidv4();
    let obj = { playerId: playerId,
                playerName: req.body.playerName,
                token: token };
    // Esto podrias llevarlo al modelo
    // y simplemente haces un player.save
    redisClient.hmset(`player#${playerId}`, obj, (err, result) => {
      if (result) {
        console.log("-------------------------");
        console.log("Created player "+obj.playerId);
        console.log("Name: "+obj.playerName);
        console.log("Token: "+obj.token);
        console.log("-------------------------");
        res.status(201).json(
          {
            status: 'ok',
            response:{playerId:playerId, token: token}
          }
        );
      } else {
        res.status(400).json(
          { status: 'error',
            response:{ error: 'cant_create' }}
        );
      }
    });
  }
});

module.exports = router;
