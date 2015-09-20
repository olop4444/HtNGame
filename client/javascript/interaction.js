// interaction.js
// -- client-side of Socket.io

var socket = io();

var playerNumber;
var canMove = true;
var endPositions;
var gameStarted = false;

var difficulty = 0;
if(location.search){
    var diff = location.search.substring(1)
    if(diff == "1") difficulty = 1;
    else if(diff == "2") difficulty = 2;
    else if(diff == "3") difficulty = 3;
}
socket.emit('choose difficulty', difficulty);

socket.on("player number", function(num) {
	playerNumber = num;
	document.getElementById("waiting").style.display = "none";
});

socket.on("map", function(map) {
	var width = map.width;
	var height = map.height;
	playerPositions = [map.A_start, map.B_start];
	endPositions = map.end_points;
	cells = map.cells;
	drawCells();
	gameStarted = true;
});

socket.on("receive action", function(action) {
	move(action.playerNum, action.direction);
	canMove = true;
});

socket.on("dc", function(playerId) {
	document.getElementById("waiting").innerHTML = "A player disconnected. Please refresh to play again.";
	socket.disconnect();
});

socket.on("reset", function() {
	reset();
});

document.onkeydown = checkKey;

function checkKey(e) {
	if(gameStarted && canMove && !inMotion()) {
		canMove = false;

		e = e || window.event;

		var dir = null;
		if (e.keyCode == '38') {
			dir = 'u';
		}
		else if (e.keyCode == '40') {
			dir = 'd';
		}
		else if (e.keyCode == '37') {
			dir = 'l';
		}
		else if (e.keyCode == '39') {
			dir = 'r';
		}
		if (dir != null) {		
			var action = {};
			action["playerNum"] = playerNumber;
			action["direction"] = dir;

			socket.emit("send action", action);
		} else {
			canMove = true;
		}
	}
}

function move(playerNum, direction) {
	var landingPosition = moveOutcome(playerNum,direction);
	
	playerPositions[playerNum] = landingPosition;
	
	if (isComplete()) {
		socket.emit("victory");
		gameStarted = false;
		var snd = new Audio("../music/Ice_Level_Up_Fanfare_ABRIDGED.m4a");
		snd.play();
	}
}

function moveOutcome(playerNum, direction) {
	var currentPosition = playerPositions[playerNum].slice();
    var otherPosition = playerPositions[(playerNum+1)%2];

    while(true){
        var nextPosition = currentPosition.slice();
		if(direction == 'u') {
			nextPosition[1] -= 1;
		} else if (direction == 'd') {
			nextPosition[1] += 1;
		} else if (direction == 'l') {
			nextPosition[0] -= 1;
		} else if (direction == 'r') {
			nextPosition[0] += 1;
		}
		
		if(cells[nextPosition[1]][nextPosition[0]] == "W" ||
           (nextPosition[0] == otherPosition[0] && nextPosition[1] == otherPosition[1])){
            console.log("cur, next, other are " + currentPosition + ", " + nextPosition + ", " + otherPosition);
            return currentPosition;
        }

        currentPosition = nextPosition;
	}
}

function isComplete() {
	var victory = true;
	endPositions.forEach(function (endPosition) {
		victory = victory && playerPositions.some(function (playerPosition) {
			return playerPosition[0] == endPosition[0] && playerPosition[1] == endPosition[1];
		});
	});
	return victory;
}

function requestReset() {
	socket.emit('request reset');
}

function requestNewGame() {
	socket.emit('request new game', difficulty);
}

function reset() {
	playerPositions[0] = [1,1];
	playerPositions[1] = [2,1];
	gameStarted = true;
}
