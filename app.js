var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const config = require('./config');

var indexRouter = require('./routes/index');

var app = express();

// mysql & session setting
var session = require("express-session");
var mysqlStore = require("express-mysql-session")(session);

var mysqlOptions = {
  host: '172.19.148.51',
  port: 3306,
  user: 'root',
  password: '8804',
  database: 'nc_qr_auth',
  clearExpired: true,
  checkExpirationInterval: config.sessionExpirationInterval,
  expiration: config.sessionExpireTime
}

var sessionStore = new mysqlStore(mysqlOptions);

app.use(session({
  key: 'user-session',
  secret: 'servicePlatform',
  store: sessionStore,
  saveUninitialized: false,
  resave: false
}));

// mysql & session setting end


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// set the secret key variable for jwt
app.set('jwt-secret', config.secret)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

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

module.exports = app;
