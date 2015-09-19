	
var socket = io();

var playerNumber;
var canMove = true;

socket.on("player number", function(num) {
	playerNumber = num;
});

socket.on("map", function(map) {
	//make map
});

socket.on("receive action", function(action) {
	//do action
	canMove = true;
});

socket.on("dc", function(playerId) {
	//"player playerId has disconnected"
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
		action["player"] = playerNumber;
		action["direction"] = dir;

		socket.emit('send action', action);
	}
}