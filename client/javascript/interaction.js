// interaction.js
// -- client-side of Socket.io

var socket = io();

var playerNumber;
var canMove = true;
var endPositions;


socket.on("player number", function(num) {
	playerNumber = num;
});

socket.on("map", function(map) {
	var width = map.width;
	var height = map.height;
	playerPositions = [map.A_start, map.B_start];
	endPositions = map.end_points;
	cells = map.cells;
	drawCells();
});

socket.on("receive action", function(action) {
	move(action.playerNum, action.direction);
	canMove = true;
});

socket.on("dc", function(playerId) {
	//"player playerId has disconnected"
	socket.disconnect();
});

document.onkeydown = checkKey;

function checkKey(e) {
	if(canMove) {
		canMove = false;

		e = e || window.event;

		var dir;
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
		
		var action = {};
		action["playerNum"] = playerNumber;
		action["direction"] = dir;

		socket.emit("send action", action);
	}
}

function move(playerNum, direction) {
	var landingPosition = moveOutcome(playerNum,direction);
	
	//do animations?
	playerPositions[playerNum] = landingPosition;
	
	//check for victory
	if (isComplete()) {
		socket.emit("victory");
	}
}

function moveOutcome(playerNum, direction) {
	var currentPosition = playerPositions[playerNum];
	var nextPosition = currentPosition;
	var collision = false;
	
	while(!collision) {
		if(direction == 'u') {
			nextPosition[1] -= 1;
		} else if (direction == 'd') {
			nextPosition[1] += 1;
		} else if (direction == 'l') {
			nextPosition[0] -= 1;
		} else if (direction == 'r') {
			nextPosition[0] += 1;
		}
		
		if(cells[nextPosition[0]][nextPosition[1]] == "W")
			collision = true;
		else if (playerPositions.indexOf(nextPosition) != -1)
			collision = true;
		else
			currentPosition = nextPosition;
	}
	
	return currentPosition;
}

function isComplete() {
	endPositions.forEach(function (endPosition) {
		var found = false;
		playerPositions.forEach(function (playerPosition) {
			if(playerPosition == endPosition) {
				found = true;
			}
		});		
		if(!found) 
			return false;
	});
	return true;
}