var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var redis = require('redis');
var redisClient = redis.createClient();
var cors = require('cors');
const result = require('dotenv').config();
if (result.error) {throw result.error}

var indexRouter = require('./routes/index');
var lobbiesRouter = require('./routes/lobbies');
var playersRouter = require('./routes/players');

redisClient.on('error', function (err) {
  console.log('Error ' + err);
})

var app = express();

const port = process.env.PORT || 3500;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/lobbies', lobbiesRouter);
app.use('/players', playersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port)
console.log(`Backend escuchando en localhost:${port}`);
module.exports = app;