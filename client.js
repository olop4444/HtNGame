	
var socket = io();

var playerNumber;

socket.on("player number", function(num) {
	playerNumber = num;
});

socket.on("map", function(map) {
	//make map
});

socket.on("action", function(action) {
	//do action
});

socket.on("dc", function(playerId) {
	//"player playerId has disconnected"
});

document.onkeydown = checkKey;

function checkKey(e) {

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

	socket.emit('action', action);
}