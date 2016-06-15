var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var fs = require('fs');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var Info = require('./models/InfoModel.js');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/data',  express.static(__dirname + '/../../uploads'));

app.get('/', function(req, res) {
    res.sendFile('index.html');
});

app.get('/data/get', function(req, res) {
    var accessCode = req.query.accessCode;
    Info.find({accessCode: accessCode}, function(err, users) {
        if (err) {
            console.log(err);
            res.sendStatus(404);
            return;
        }
        if (users.length == 0) {
            res.sendStatus(404);
            return;
        }
        //console.log(users[0].data);
        res.json(JSON.stringify(users[0].data));
    });
});

app.post('/data/new', function(req, res) {
    var accessCode = req.body.accessCode;
    var data = req.body.data;
    Info.update(
        {
            accessCode: accessCode
        },
        {
            accessCode: accessCode,
            data: data
        },
        function(err) {
            if (err) {
                console.log(err);
                res.sendStatus(400);
            } else {
                res.sendStatus(200);
            }
        });
});

app.listen(8124);

module.exports = app;
