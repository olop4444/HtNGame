// render.js
//  -- setting up canvas

// Pixi JS renderer instance
var renderer = PIXI.autoDetectRenderer(CANVAS_HEIGHT, CANVAS_WIDTH);

// Add renderer into DOM tree
var containerk = document.getElementById('canvas-container');
containerk.appendChild(renderer.view);

// Set rendering stage
var stage = new PIXI.Container();

var terrain = new PIXI.Container(),
	units = new PIXI.Container();

stage.addChild(terrain);
stage.addChild(units);


// requestAnimationFrame(animate);

// function animate() {
// 	requestAnimationFrame(animate);

// 	// console.log('animate ran');

// 	// render the stage
// 	renderer.render(stage);
// }

// Draw Terrain
