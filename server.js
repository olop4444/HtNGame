var MAX_ROOM_SIZE = 2;


// -------


var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');

app.listen(80);

var serve = serveStatic(__dirname + "/static/");

function handler(request, response) {
  var done = finalhandler(request, response);
  serve(request, response, done);
}

var roomSockets = {};
var waitingSockets = [];
var nextRoomId = 1;

function addPlayer(socket) {
  waitingSockets.push(socket);

  if (waitingSockets.length >= MAX_ROOM_SIZE) {
	var i = 0;
    waitingSockets.forEach(function (socket) {
      socket.join(nextRoomId);
      socket.roomId = nextRoomId;
	  socket.playerId = i++;
      if (roomSockets[nextRoomId] == null) {
        roomSockets[nextRoomId] = [socket];
      } else {
        roomSockets[nextRoomId].push(socket);
      }
	  socket.emit("player number",i);
    });
    nextRoomId++;
    waitingSockets = [];
  }

  // TODO get game and send to room.
}

function processAction(socket, action) {
  io.to(socket.roomId).emit("action", action);
}

function removePlayer(socket) {
  io.to(socketsToRooms[socket]).emit('dc',socket.playerId);
  roomSockets[socket.roomId] = null;
}

io.on('connection', function (socket) {
  addPlayer(socket);
  socket.on('event', function (data) {
	processAction(socket,data);
  });
  socket.on('disconnect', function () {
    removePlayer(socket);
  });
});
