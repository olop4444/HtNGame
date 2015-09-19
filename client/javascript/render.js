// render.js
//  -- setting up canvas

// Pixi JS renderer instance
var renderer = PIXI.autoDetectRenderer(800, 600);

// Add renderer into DOM tree
document.body.appendChild(renderer.view);

var stage = new PIXI.container();

var container

// requestAnimationFrame(animate);

// function animate() {
// 	requestAnimationFrame(animate);

// 	// console.log('animate ran');

// 	// render the stage
// 	renderer.render(stage);
// }

// Draw Base
