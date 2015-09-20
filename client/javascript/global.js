// global.js
// -- variables of global scope
//    (included before other files)

// --- Constants ---

// Canvas Dimensions
var CANVAS_HEIGHT = 600,
	CANVAS_WIDTH = 600;

// Terrain Textures
var GRASS_TILE_TEXTURE = PIXI.Texture.fromImage('images/grass_tile.jpg');
var ICE_TILE_TEXTURE = PIXI.Texture.fromImage('images/ice_tile.jpg');
var TREE_STOMP_TEXTURE = PIXI.Texture.fromImage('images/tree_stomp.png');
var ICE_WALL_TEXTURE = PIXI.Texture.fromImage('images/ice_wall.png');

// Unit Textures; TODO: replace tree stumps with something else
var PLAYER_A_TEXTURE = PIXI.Texture.fromImage('images/tree_stomp.png');
var PLAYER_B_TEXTURE = PIXI.Texture.fromImage('images/red_stump.png');


// Cell Types
var CELL_ICE = " ",
	CELL_WALL = "W",
	CELL_STOMP = "S",
	CELL_GRASS = "O";


// Variables
var cells;
var playerPositions;


