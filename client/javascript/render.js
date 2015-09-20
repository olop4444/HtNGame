// render.js
//  -- setting up canvas

// Pixi JS renderer instance
var renderer = PIXI.autoDetectRenderer(CANVAS_HEIGHT, CANVAS_WIDTH);

// Add renderer into DOM tree
var container = document.getElementById('canvas-container');
container.appendChild(renderer.view);

// Set rendering stage
var stage = new PIXI.Container();

// Inner containers (layers)
var terrain = new PIXI.Container(),
	units = new PIXI.Container();

stage.addChild(terrain);
stage.addChild(units);

var cellWidth;

function resetStage() {
	terrain.removeChildren();
	units.removeChildren();
}

function drawTerrain() {
	cells.forEach(function (row, rowIndex) {
		row.forEach(function (cell, columnIndex) {
			var tile;
			switch (cell) {
				case CELL_ICE:
					tile = new PIXI.Sprite(ICE_TILE_TEXTURE); break;
				case CELL_WALL:
					tile = new PIXI.Sprite(ICE_WALL_TEXTURE); break;
				case CELL_STOMP:
					tile = new PIXI.Sprite(TREE_STOMP_TEXTURE); break;
				case CELL_GRASS:
					tile = new PIXI.Sprite(GRASS_TILE_TEXTURE); break;
			}
			tile.position.x = columnIndex * cellWidth;
			tile.position.y = rowIndex * cellWidth;

			tile.width = tile.height = cellWidth;

			terrain.addChild(tile);
		});
	});
}

function drawUnits() {
    playerA = new PIXI.Sprite(PLAYER_A_TEXTURE);
    playerB = new PIXI.Sprite(PLAYER_B_TEXTURE);

    playerA.position.x = playerPositions[0][0] * cellWidth;
    playerA.position.y = playerPositions[0][1] * cellWidth;
    playerB.position.x = playerPositions[1][0] * cellWidth;
    playerB.position.y = playerPositions[1][1] * cellWidth;
    playerA.width = playerA.height = playerB.width = playerB.height = cellWidth;

    units.addChild(playerA);
    units.addChild(playerB);
}

function drawCells() {
	resetStage();

    cellWidth = Math.min(Math.floor(CANVAS_WIDTH/cells[0].length),
                         Math.floor(CANVAS_HEIGHT/cells.length))

	drawTerrain();
	drawUnits();
}

// Animate
animate();

function animate() {
	requestAnimationFrame(animate);

	renderer.render(stage);
}
