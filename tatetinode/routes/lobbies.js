var express = require('express');
var router = express.Router();
var redis = require ('redis');
const redisClient = redis.createClient();
const Lobby = require('../models/lobby');
const Player = require('../models/player');


//CREATE LOBBY
//input needed: lobbyName, lobbyPass, playerId, token
//output: idLobby
router.post('/', async function(req, res, next){
  // Lo primero que tenes que hacer en todos los actions
  // es verificar el Authorization
  // Esta validacion podrias pasarla al modelo Lobby
  // entonces podiras hacer algo tipo:
  // lobby = new Lobby(req.body)
  // y luego podrias hacer un lobby.valid?
  // y lo que podes hacer es definir un atributo dentro de players
  // que era errors, entonces cuando haces el valid, metes los errores
  // que correspondan al errors y devolver true o false
  if (req.body.lobbyName.length <= 3 ||
      req.body.lobbyName.length >= 26 ||
      req.body.lobbyPass.length >= 26 ||
      !(/^$|^[A-Za-z0-9]+$/.test(req.body.lobbyPass)) ){
    res.status(400).json({status: 'error', response:{error: 'inappropriateLobbyNameOrPass'}});
  }else{
    const myPlayer = await Player.find(req.body.playerId);
    if(req.header('Authorization') === myPlayer.token){
      let lobbyId = await Lobby.nextId();
      Lobby.setId(lobbyId);
      let obj;
      //Creating Lobby without a password
      if (req.body.lobbyPass === "" ||
          req.body.lobbyPass === undefined ||
          req.body.lobbyPass ===null) {

        obj = { lobbyId: lobbyId,
                lobbyName: req.body.lobbyName,
                hostName: myPlayer.playerName,
                lobbyBoolPass: false,
                lobbyPass: "",
                gameState: 'available',
                player1Token: req.header('Authorization')};
      } else {
        //Creating Lobby with a password
        obj = { lobbyId: lobbyId,
                lobbyName: req.body.lobbyName,
                hostName: myPlayer.playerName,
                lobbyBoolPass: true,
                lobbyPass: req.body.lobbyPass,
                gameState: 'available',
                player1Token: req.header('Authorization')};
      }
      // Esto podrias llevarlo al modelo
      // y simplemente haces un lobby.save
      redisClient.hmset(`lobby#${lobbyId}`, obj, (err, result) => {
        if (result) {
          redisClient.sadd(`availableLobbies`, `${lobbyId}`, (err, result) => {
            if (result) {
              console.log("-------------------------");
              console.log(`Created lobby ${lobbyId}: ${obj.lobbyName}`);
              console.log("Host: "+obj.hostName);
              console.log("Has password?: "+obj.lobbyBoolPass);
              console.log("Password: "+obj.lobbyPass);
              console.log("-------------------------");
              res.status(201).json({ status: 'ok', response:{lobbyId: lobbyId}});
            } else {
              res.status(400).json({status: 'error', response:{error: 'cantCreate2'}});
            }
          });
        } else {
          res.status(400).json({status: 'error', response:{error: 'cantCreate'}});
        }
      });
    } else{
      res.status(400).json({status: 'error', response:{ error: 'wrongToken' }});
    }
  }
});


//GET AVAILABLE LOBBIES
//input needed:
//output: availableLobbies //array
router.get('/', async function(req, res, next){
  // Lo primero que tenes que hacer en todos los actions
  // es verificar el Authorization
  redisClient.smembers(`availableLobbies`, async (err, result) => {
    if (result) {
      let availableLobbies = [];
      let count = 0;
      if (result.length >=1){
        result.forEach(async element => {
          const myLobby = await Lobby.find(element);
          let oneLobby = {
            lobbyId: myLobby.lobbyId,
            lobbyName: myLobby.lobbyName,
            hostName: myLobby.hostName,
            lobbyBoolPass: myLobby.lobbyBoolPass
          };
          availableLobbies[count] = oneLobby;
          count +=1;
        });
        // Esto tiene que ir afuera del foreach
        // y el if no hace falta ya que te aseguras que si estas dentro de este
        // bloque sabes que almenos tenes uno
        res.status(200).json({ status: 'ok', response:{lobbies: availableLobbies}});

      } else {
        // Aca no deberia de ser { status: 'error' response: { error: 'noLobbies' } }
        res.status(200).json({ status: 'noLobbies', response:{}});
      }
    } else {
      res.status(400).json({status: 'error', response:{error: 'cantGetLobbies'}});
    }
  });
});


//JOIN LOBBY AND START THE GAME
//input needed: lobbyId, lobbyPass, playerId, token
//output: ok
// Aca lo que podrias definir es un action join
// router.put('/:id/join', async function(req, res, next){
// por que el put es extremadamente generico pero vos los estas
// usando solamente para joinear aun chango
router.put('/:id', async function(req, res, next){
  const myLobby = await Lobby.find(req.params.id);
  // Y si te paso un ide de lobby que no existe?
  // Lo primero que tenes que hacer en todos los actions
  // es verificar el Authorization
  if(myLobby.gameState === 'available'){
    if (req.body.lobbyPass === myLobby.lobbyPass){
      const myPlayer = await Player.find(req.body.playerId);
      // y si te paso un id de player que no existe?
      if(req.header('Authorization') === myPlayer.token){
        let obj= { player2Name:myPlayer.playerName,
                   player2Token: req.header('Authorization'),
                   gameState: 'playing',
                   boolVictory: false,
                   turnCount: 1,
                   turnPlayer: 1 + Math.round(Math.random()),
                   board:'         ',
                   player1Victories: 0,
                   player2Victories: 0,
                   draws: 0,
                   rematch1: false,
                   rematch2: false };

        redisClient.hmset(`lobby#${myLobby.lobbyId}`, obj, (err, result) => {
          if (result) {
            // Groso esto!!!
            redisClient.srem(`availableLobbies`, `${req.params.id}`, (err, result) => {
              if (result) {
                console.log(`Lobby ${myLobby.lobbyId} ready to play`);
                res.status(200).json({ status: 'ok', response:{}});
              } else {
                res.status(400).json({status: 'error', response:{error: 'cantDeleteFromSet'}});
              }
            });
          } else {
            res.status(400).json({status: 'error', response:{error: 'cantJoin'}});
          }
        });
      } else{
        res.status(400).json({status: 'error', response:{error: 'wrongToken'}});
      }
    } else{
      res.status(400).json({status: 'error', response:{error: 'wrongPassword'}});
    }
  } else {
    res.status(400).json({status: 'error', response:{error: 'notAvailable'}});
  }
});


//DELETE LOBBY / CANCEL LOBBY CREATION
//input needed: lobbyId, token
//output: ok
router.delete('/:id', async function(req, res, next) {
  // Y si te paso un id de algo que no existe?
  const myLobby = await Lobby.find(req.params.id);
  redisClient.hget(`lobby#${req.params.id}`, "player1Token", (err, result) => {
    if (result) {
      myLobby.player1Token = result;
      if (myLobby.player1Token == req.header('Authorization')){
        redisClient.del(`lobby#${req.params.id}`, (err, result) => {
          if (result) {
            redisClient.srem(`availableLobbies`, `${req.params.id}`, (err, result) => {
              if (result) {
                console.log(`Deleted lobby ${req.params.id}`);
                res.status(200).json({status: 'ok', response:{}});
              } else {
                res.status(400).json({status: 'error', response:{error: 'cantDeleteFromSet'}});
              }
            });
          } else {
            res.status(400).json({status: 'error', response:{error: 'cantDelete'}});
          }
        });
      } else {
        res.status(400).json({status: 'error', response:{error: 'wrongToken'}});
      }
    } else {
      res.status(400).json({status: 'error', response:{error: 'cantFindToDelete'}});
    }
  });
});


//CHECK IF MY LOBBY IS FULL
//input needed: lobbyId, token
//output: true or false
router.get('/:id/isFull', async function(req, res, next){
  const myLobby = await Lobby.find(req.params.id);
  if (myLobby.player1Token == req.header('Authorization')){
    // el chequeo creo que lo deberias de hacer por estado del lobby
    redisClient.hexists(`lobby#${req.params.id}`, "player2Token", (err, result) => {
      if (result==1) {
        res.status(200).json({ status: 'ok', response:{ isFull: true, player2Name: myLobby.player2Name}});
      } else {
        if (result==0) {
          res.status(200).json({status: 'ok', response:{isFull: false}});
        } else {
          res.status(400).json({status: 'error', response:{error: 'cantCheck'}});
        }
      }
    });
  } else {
    res.status(400).json({status: 'error', response:{error: 'wrongToken'}});
  }
});


//MAKE A MOVE / MARK A CELL
//input needed: cell, lobbiId, token
//output: board, gameResult
router.put('/:id/move', async function(req, res, next){
  // primero acordate que hay que ver el authorization sea valido
  // asi te evitas de hacer todo este primero chequeo ya que si no
  // tiene un token valido el chabon no de deberia de ni jugar
  let obj;
  const myLobby = await Lobby.find(req.params.id);
  if (myLobby.gameState === 'playing'){
    if (req.body.cell <= 8 && req.body.cell >= 0){
      let playerToken;
      let opponentToken;
      let symbol;
      if (parseInt(myLobby.turnPlayer) === 1) {
        playerToken = myLobby.player1Token;
        opponentToken = myLobby.player2Token;
        symbol = 'X';
      } else {
        playerToken = myLobby.player2Token;
        opponentToken = myLobby.player1Token;
        symbol = 'O';
      }
      if (playerToken == req.header('Authorization')){
        if (myLobby.board[req.body.cell] === ' '){
          let board = replaceCharInString(myLobby.board, req.body.cell, symbol);
          const boolVictory = await checkVictory(board, symbol);
          let newVictories1 = 0;
          let newVictories2 = 0;
          let newDraws = 0;
          let nextTurn = parseInt(myLobby.turnCount)+1;
          // Ya el tablero tiene este estado no hace falta que se lo pongas
          // lo tiene en el momento que se joineo alguien
          let newGameState = 'playing';


          if (boolVictory === true){
            newGameState = 'gameEnded';
            if (parseInt(myLobby.turnPlayer) === 1){
              newVictories1 = 1;
            } else {
              newVictories2 = 1;
            }
          } else {
            if (nextTurn >= 10){
              newGameState = 'gameEnded';
              newDraws = 1;
            }
          }

          obj = { board: board,
                  turnCount: parseInt(myLobby.turnCount) + 1,
                  turnPlayer: 3 - parseInt(myLobby.turnPlayer),
                  boolVictory: boolVictory,
                  player1Victories: parseInt(myLobby.player1Victories) + newVictories1,
                  player2Victories: parseInt(myLobby.player2Victories) + newVictories2,
                  draws: parseInt(myLobby.draws) + newDraws,
                  gameState: newGameState };

          redisClient.hmset(`lobby#${req.params.id}`, obj, (err, result) => {
            if (result) {
              console.log(symbol + " in cell "+req.body.cell);
              if (boolVictory ===true){
                res.status(200).json({ status: 'ok',
                                       response:{ board: board,
                                                  gameResult: 'victory',
                                                  player1Victories: obj.player1Victories,
                                                  player2Victories: obj.player2Victories }});
              } else{
                if (nextTurn>=10){
                  res.status(200).json({ status: 'ok',
                                         response: { board: board,
                                                     gameResult: 'draw',
                                                     draws:obj.draws }});
                } else{
                  res.status(200).json({ status: 'ok',
                                         response: { board: board, gameResult: 'stillPlaying' }});
                }
              }
            } else {
              res.status(400).json({status: 'error', response:{error: 'cantCreate'}});
            }
          });
        } else{
          res.status(400).json({status: 'error', response:{error: 'occupiedCell'}});
        }
      } else{
        if (opponentToken == req.header('Authorization')){
          res.status(400).json({status: 'error', response:{error: 'notYourTurn'}});
        } else{
          res.status(400).json({status: 'error', response:{error: 'wrongToken'}});
        }
      }
    }else{
      res.status(400).json({status: 'error', response:{error: 'cellDoesntExist'}});
    }
  } else{
    res.status(400).json({status: 'error', response:{error: 'notPlayable'}});
  }
});



function replaceCharInString (word, index, replacement) {
  return (word.substring(0, index) + replacement + word.substring(index+1, word.length+1));
}


function checkVictory(board, symbol){
  return new Promise(resolve => {
    const victoryWord = symbol+symbol+symbol;
    let i;
    let j;
    let board2D = [
      [board[0], board[1], board[2]],
      [board[3], board[4], board[5]],
      [board[6], board[7], board[8]]
    ];

    let text;
    for (i = 0; i < 3; i++){
      text = "";
      for (j = 0; j < 3; j++){
        text += board2D[i][j];
      }
      if (text==victoryWord) resolve (true);            //check victory by row
    }

    for (j = 0; j < 3; j++){
      text = "";
      for (i = 0; i < 3; i++){
        text += board2D[i][j];
      }
      if (text==victoryWord) resolve (true);            //check victory by column
    }

    text = board2D[0][0]+board2D[1][1]+board2D[2][2];
    if (text==victoryWord) resolve (true);                //check victory by \ diagonal

    text = board2D[2][0]+board2D[1][1]+board2D[0][2];
    if (text==victoryWord) resolve (true);                //check victory by / diagonal

    resolve (false);
  });
}



//CHECK GAME STATE
//input needed: lobbyId, token
//output: board, gameResult //also amount of victories and draws if needed
router.get('/:id', async function(req, res, next){
  const myLobby = await Lobby.find(req.params.id);
  if (myLobby.gameState === 'playing' || myLobby.gameState === 'gameEnded'){
    let playerToken;
    let opponentToken;
    if (parseInt(myLobby.turnPlayer) === 1){
      playerToken = myLobby.player1Token;
      opponentToken = myLobby.player2Token;
    } else{
      playerToken = myLobby.player2Token;
      opponentToken = myLobby.player1Token;
    }
    if (playerToken == req.header('Authorization')){
      if (JSON.parse(myLobby.boolVictory)===true){
        res.status(200).json({ status: 'ok', response:{board: myLobby.board, gameResult: 'defeat', player1Victories: myLobby.player1Victories, player2Victories: myLobby.player2Victories}});
      } else{
        if (parseInt(myLobby.turnCount)>=10){
          res.status(200).json({ status: 'ok', response:{board: myLobby.board, gameResult: 'draw', draws:myLobby.draws}});
        } else{
          if(myLobby.gameState === 'playing'){
            res.status(200).json({ status: 'ok', response:{board: myLobby.board, gameResult: 'yourTurnToPlay'}});
          } else{
            res.status(200).json({status: 'ok', response:{board: myLobby.board, gameResult: 'waitingOpponentRematch'}});
          }
        }
      }
    } else{
      if (opponentToken == req.header('Authorization')){
        if(myLobby.gameState === 'playing'){
          res.status(200).json({status: 'ok', response:{board: myLobby.board, gameResult: 'waitingOpponentMove'}});
        } else{
          res.status(200).json({status: 'ok', response:{board: myLobby.board, gameResult: 'waitingOpponentRematch'}});
        }
      } else{
        res.status(400).json({status: 'error', response:{error: 'wrongToken'}});
      }
    }
  } else{
    res.status(400).json({status: 'error', response:{error: 'notPlayable'}});
  }
});


//REMATCH AND RESTART GAME
//input needed: lobbyId, token
//output: ok
router.put('/:id/rematch', async function(req, res, next){
  const myLobby = await Lobby.find(req.params.id);
  if (myLobby.player1Token == req.header('Authorization') || myLobby.player2Token == req.header('Authorization')){
    if (myLobby.gameState ==='gameEnded'){
      let newRematch1= JSON.parse(myLobby.rematch1);
      let newRematch2= JSON.parse(myLobby.rematch2);
      let obj;
      if (myLobby.player1Token == req.header('Authorization')){
        newRematch1= true;
      } else{
        newRematch2= true;
      }
      if(newRematch1===true && newRematch2===true){   //Both players want a rematch
        obj= {
          gameState: 'playing',
          boolVictory:false,
          turnCount:1,
          turnPlayer:1+Math.round(Math.random()),
          board:'         ',
          rematch1: false,
          rematch2: false
        };
      } else {                                        //One player wants rematch and is waiting for the other to decide
        obj = {
          rematch1: newRematch1,
          rematch2: newRematch2,
          boolVictory:false,
          turnCount:1
        }
      }

      redisClient.hmset(`lobby#${myLobby.lobbyId}`, obj, (err, result) => {
        if (result) {
          res.status(200).json({ status: 'ok', response:{}});
        } else {
          res.status(400).json({status: 'error', response:{error: 'cantStartRematch'}});
        }
      });
    } else{
      res.status(400).json({status: 'error', response:{error: 'gameHasntEnded'}});
    }
  }else {
    res.status(400).json({status: 'error', response:{error: 'wrongToken'}});
  }
});

module.exports = router;
