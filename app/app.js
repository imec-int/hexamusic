#!/usr/bin/env node

var express = require('express');
var http = require('http')
var path = require('path');
var socketio = require('socket.io');
var socketclient = require('socket.io-client'); // to connect to our server
var utils = require('./utils');
var midimapping = require('./midimapping');
// var twittersearch = require('./twittersearch'); // ORIGINAL
var twittersearch = require('./twittersearch2'); // COMPLETE TWEETS

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('hexamusic123456789987654321'));
	app.use(express.session());
	app.use(app.router);
	app.use(require('stylus').middleware(__dirname + '/public'));
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

var webserver = http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

app.get('/', function (req, res){
	res.render('index', { title: 'Hexamusic' });
});

app.get('/admin', function (req, res){
	res.render('admin', { title: 'Hexamusic | Admin' });
});

app.get('/boe', function (req, res){

	console.log( req.query.test );


	res.send(200);
});

// (server) Socket IO
var io = socketio.listen(webserver);
var clients = [];
var ccolor ="#DFEFEE";
io.set('log level', 0);


// Client Socket (speciaal om met onze mixmini te verbinden):
clientio = socketclient.connect('mixmini.mixlab.be', {port: 3000});

clientio.on('connect', function () {
	console.log("socket connected to mixmini.mixlab.be");
});

clientio.on('midi', function (rawmidiMessage) {
	var readableMessage = midimapping.parseMessage(rawmidiMessage);

	//console.log(rawmidiMessage);
	//console.log(readableMessage);
//	console.log("midi received!");

	//if(readableMessage.type == 'Note on' && readableMessage.channel == 1)
	if(readableMessage.type == 'Note on')
	//if(readableMessage.type == 'Note on')
	{
		console.log(readableMessage)
		io.sockets.in('scherm').emit('midi', rawmidiMessage);
		io.sockets.in('app').emit('midi', rawmidiMessage);
		//color='#'+Math.floor(Math.random()*16777215).toString(16);
		//io.sockets.emit('ctrl', {bgcolor: color});
		paansturing(rawmidiMessage);
	}
//	io.sockets.in('app').emit('alert', {'alert': 'alert'});

//	if(readableMessage.channel == 0)
//	{
//		io.sockets.emit('midi', rawmidiMessage);
//		color='#'+Math.floor(Math.random()*16777215).toString(16);
//		io.sockets.emit('ctrl', {bgcolor: color});
//	};
});

io.sockets.on('connection', function (socket) {
	socket.on('join',function(room) {
		socket.join(room);
		console.log("Joined "+room);
		if(room == 'app')
		{
		clients.push(socket.id);
		io.sockets.in('app').emit('ctrl',{bgcolor:ccolor});
		console.log(io.sockets.clients(room).length)
		}
	});

	socket.on('leap', function(data) {
		io.sockets.in('scherm').emit('leap',{msg:data});
		console.log(data);
	});
	// REPLACE WITH TWITTERSEARCH.JS (SEE BELOW)
	// socket.on('twitter', function(data) {
	// 	io.sockets.in('scherm').emit('twitter',{msg:data});
	// 	console.log(data);
	// });
	socket.on('color', function(data) {
		io.sockets.emit('ctrl', {bgcolor: data.my});
		io.sockets.in('scherm').emit('ctrl',{bgcolor:data.my});
		ccolor=data.my;
		console.log(data);
	});
	socket.on('disconnect', function() {
		console.log('Got disconnect!');

		var i = clients.indexOf(socket);
		delete clients[i];
	});
});

setInterval(makeAdmin,(20*1000));
makeAdmin();

function makeAdmin()
{
	if(io.sockets.clients('app').length == 0)
		return console.log('> no smartphones connected. No one can be admin.');

	var rid = Math.floor((Math.random()*io.sockets.clients('app').length));

	console.log('> ' + io.sockets.clients('app').length + ' smartphones connected. Will make smartphone[' + rid + '] admin.');

	// alle smartphone sockets overlopen en de juiste admin maken:
	for (var i = 0; i < io.sockets.clients('app').length; i++) {
		var socket = io.sockets.clients('app')[i];
		if(i == rid){
			socket.emit('admin', {
				active: 1
			});
		}else{
			socket.emit('admin', {
				active: 0
			});
		}
	};
}
function paansturing(rMsg)
{
//	console.log("projectie emit!");
	// SetScaleX
	// SetScaleY
	// SetScaleZ
	// SetSpacingX
	// SetSpacingY
	// SetCubesX
	// setCubesY
	// SetColor
	io.sockets.emit('projectie',{projectie: [rMsg[0],rMsg[0],rMsg[0],rMsg[0],rMsg[0],rMsg[0],rMsg[0]]});
}
function sendSomeCrazySocketEvent(){
	io.sockets.emit('ctrl', {color: '#FFFFFF'});
}

// Twitter search:
twittersearch.onUpdate(function (data) {
	io.sockets.in('scherm').emit('twitter',{msg:data});
	console.log(data);
});



