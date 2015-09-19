// main.js
//  -- setting up canvas

// Pixi JS renderer instance
var renderer = PIXI.autoDetectRenderer(800, 600);

// Add renderer into DOM tree
document.body.appendChild(renderer.view);

var stage = new PIXI.Stage(0x66FF99);

requestAnimationFrame(animate);

function animate() {
	requestAnimationFrame(animate);

	// console.log('animate ran');

	// render the stage
	renderer.render(stage);
}

var socket = io();

socket.on('news', function (data) {
	console.log(data);
});
