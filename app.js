var express = require('express');

var path = require('path');
var session = require('client-sessions');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');

var app = express();

app.use( session( {
   cookieName : 'session',
   secret : 'A#*BAKRAABLGOA@G!ej%d>d3hGOAbkao35DF',
   duration : 60 * 1000, // 60 seconds
   activeDuration : 60*1000
} ) );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
   app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.send( { msg : err.message } );
   });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
   res.status(err.status || 500);
   res.send( { msg: err.message } );
  } );


module.exports = app;
