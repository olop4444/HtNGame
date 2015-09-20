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

var waitingSockets = [[], [], [], []]
var nextRoomId = 0;

function addPlayer(socket, difficulty) {
  console.log('New player: ');

  waitingSockets[difficulty].push(socket);

  console.log('  added to waiting; queue size ' + waitingSockets[difficulty].length);

  if (waitingSockets[difficulty].length >= MAX_ROOM_SIZE) {
    console.log('  adding players to room ' + nextRoomId);

    waitingSockets[difficulty].forEach(function (socket, index) {
      socket.join(nextRoomId);
      socket.roomId = nextRoomId;
	    socket.playerId = index;
		console.log('player received number: ' + index);
      
	    socket.emit("player number", index);
    });

    var width, height, pathdiff;
    if(difficulty == 0){
        width = height = 10;
        pathdiff = 14;
    }else if(difficulty == 1){
        width = height = 15;
        pathdiff = 19;
    }else if(difficulty == 2){
        width = height = 20;
        pathdiff = 27;
    }else if(difficulty == 3){
        width = height = 20;
        pathdiff = 10000;
    }

    generateMap(width, height, pathdiff, function(map){
        io.to(nextRoomId).emit("map", map);
        nextRoomId++;
        waitingSockets[difficulty] = [];
    });
  }
}

function generateMap(width, height, difficulty, callback) {
	var exec = require('child_process').exec, 
      child;
	var map;

	child = exec('./a.out ' + width + ' ' + height + ' ' + difficulty, 
    function (error, stdout, stderr) {
        if(stderr.length > 0)
          console.log('stderr:', stderr);
        if (error !== null) {
          console.log('exec error:', error);
        }
        map = JSON.parse(stdout);
        callback(map);
    });
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
  }
}

function resetRequest(socket) {
	io.to(socket.roomId).emit('reset');
}

function newGame(socket) {
	generateMap(15, 15, 18, function(map){
        io.to(socket.roomId).emit("map", map);
    });
}

io.on('connection', function (socket) {
      socket.on('choose difficulty', function (difficulty){
        console.log('Player chose difficulty ' + difficulty)
        addPlayer(socket, difficulty);
      });
      socket.on('send action', function (data) {
        console.log("Received action: " + JSON.stringify(data))
        processAction(socket,data);
      });
      socket.on('disconnect', function () {
        console.log("Disconnect occurred")
        removePlayer(socket);
      });
	  socket.on('request reset', function () {
		console.log("reset requested");
		resetRequest(socket);
	  });
	  socket.on('request new game', function () {
		console.log("new game requested");
		newGame(socket);
	  });
      socket.on('victory', function () {
        console.log("victory");
      });
});
