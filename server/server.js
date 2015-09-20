var MAX_ROOM_SIZE = 2;

var DEBUG_MAP = {
  "width": 16,
  "height": 15,
  "A_start": [14, 13],
  "B_start": [14, 12],
  "end_points": [[14, 7], 
           [9, 6]],
  "min_moves": 7,
  "cells": 
    [ ["W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W"],
      ["W", " ", " ", " ", " ", " ", " ", " ", " ", "W", " ", " ", " ", " ", " ", "W"],
      ["W", " ", " ", " ", "W", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "W"],
      ["W", " ", " ", " ", " ", " ", " ", " ", " ", " ", "W", " ", " ", " ", " ", "W"],
      ["W", " ", "W", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "W"],
      ["W", "W", " ", " ", " ", " ", " ", " ", " ", "W", " ", " ", " ", " ", " ", "W"],
      ["W", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "W", "W"],
      ["W", " ", " ", " ", " ", " ", " ", "W", " ", " ", " ", " ", " ", " ", " ", "W"],
      ["W", " ", " ", "W", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "W"],
      ["W", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "W", "W"],
      ["W", " ", " ", " ", " ", " ", " ", " ", "W", " ", " ", " ", " ", " ", " ", "W"],
      ["W", " ", " ", " ", " ", " ", "W", " ", " ", " ", "W", " ", " ", " ", " ", "W"],
      ["W", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", "W"],
      ["W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", " ", "W"],
      ["W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W"]]
};


// -------


var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');

app.listen(80);

var serve = serveStatic(__dirname + "/../client/");

function handler(request, response) {
  var done = finalhandler(request, response);
  serve(request, response, done);
}

var roomSockets = {};
var waitingSockets = [];
var nextRoomId = 1;

function addPlayer(socket) {
  console.log('New player: ');

  waitingSockets.push(socket);

  console.log('  added to waiting; queue size ' + waitingSockets.length);

  if (waitingSockets.length >= MAX_ROOM_SIZE) {
    console.log('  adding players to room ' + nextRoomId);

    waitingSockets.forEach(function (socket, index) {
      socket.join(nextRoomId);
      socket.roomId = nextRoomId;
	    socket.playerId = index;

      if (roomSockets[nextRoomId] == null) {
        roomSockets[nextRoomId] = [socket];
      } else {
        roomSockets[nextRoomId].push(socket);
      }
      
	    socket.emit("player number", index);
    });

	io.to(nextRoomId).emit("map", generateMap(15, 15));
    nextRoomId++;
    waitingSockets = [];
  }
}

function generateMap(width, height) {
	var exec  = require('child_process').exec,
    child;
	var map;

	child = exec('../a.out ' + width + ' ' + height,
	function (error, stdout, stderr) {
		console.log('stderr:', stderr);
		if (error !== null) {
		  console.log('exec error:', error);
		}
		map = stdout;
	});
	return map;
}

function processAction(socket, action) {
  io.to(socket.roomId).emit("receive action", action);
} 

function removePlayer(socket) {
  var index = waitingSockets.indexOf(socket);
  if(index != -1)
	waitingSockets.splice(index,1);
  else {
    io.to(socket.roomId).emit('dc', socket.playerId);
    roomSockets[socket.roomId] = null;
  }
}

io.on('connection', function (socket) {
  addPlayer(socket);
  socket.on('send action', function (data) {
  	processAction(socket,data);
  });
  socket.on('disconnect', function () {
    removePlayer(socket);
  });
  socket.on('victory', function () {
    console.log("YAY");
  });
});
