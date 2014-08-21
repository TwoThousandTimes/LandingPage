var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sass = require('node-sass');
var http = require('http');
var db = require('./models');
var config = require('./config');
var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());


//SCSS compiler
app.use(
    sass.middleware({
        src: __dirname + '/sass',
        dest: __dirname + '/public/compiled',
        prefix:  '/compiled',
        debug: true,
    })
);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

app.set('port', config.port);

db
    .sequelize
    .sync({ force: false })
    .complete(function(err) {
        if (err) {
            throw err[0]
        } else {

        }
    });


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});



/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
