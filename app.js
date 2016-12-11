var http = require("http");
var express = require("express");
var consolidate = require("consolidate");//1
var _ = require("lodash");
var bodyParser = require('body-parser');
var socket_io = require('socket.io'); //Creating a new socket.io instance by passing the HTTP server object

var routes = require('./routes'); //File that contains our endpoints
var mongoClient = require("mongodb").MongoClient;

var app = express();
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(bodyParser.json({ limit: '5mb' }));

app.set('views', 'views'); //Set the folder-name from where you serve the html page. 
app.use(express.static('./public')); //setting the folder name (public) where all the static files like css, js, images etc are made available

app.set('view engine', 'html');
app.engine('html', consolidate.underscore);
var server = http.createServer(app);
var io = socket_io(server);
var portNumber = 8000; //for locahost:8000

server.listen(portNumber, function () { //creating the server which is listening to the port number:8000, and calls a function within in which calls the initialize(app) function in the router module
  console.log('Server listening at port ' + portNumber);

  var url = 'mongodb://localhost:27017/myUberApp';
  mongoClient.connect(url, function (err, db) { //a connection with the mongodb is established here.
    console.log("Connected to Database");

    app.get('/citizen.html', function (req, res) {
      res.render('citizen.html', {
        userId: req.query.userId
      });
    });

    app.get('/cop.html', function (req, res) {
      res.render('cop.html', {
        userId: req.query.userId
      });
    });

    app.get('/data.html', function (req, res) {
      res.render('data.html');
    });

    io.on('connection', function (socket) { //Listen on the 'connection' event for incoming sockets
      console.log('A user just connected');

      socket.on('join', function (data) { //Listen to any join event from connected users
        socket.join(data.userId); //User joins a unique room/channel that's named after the userId 
        console.log("User joined room: " + data.userId);
      });

      routes.initialize(app, db, socket, io); //Pass socket and io objects that we could use at different parts of our app
    });
  });
});

/* 1. Not all the template engines work uniformly with express, hence this library in js, (consolidate), is used to make the template engines work uniformly. Altough it doesn't have any 
modules of its own and any template engine to be used should be seprately installed!*/