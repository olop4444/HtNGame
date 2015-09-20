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
    endpoints = new PIXI.Container(),
	units = new PIXI.Container();

stage.addChild(terrain);
stage.addChild(endpoints);
stage.addChild(units);

var cellWidth;

function resetStage() {
	terrain.removeChildren();
	endpoints.removeChildren();
	units.removeChildren();
}

function drawTerrain() {
    floor = new PIXI.Sprite(ICE_TILE_TEXTURE);
    floor.position.x = 0;
    floor.position.y = 0;
    floor.width = CANVAS_WIDTH;
    floor.height = CANVAS_HEIGHT;
    terrain.addChild(floor);

	cells.forEach(function (row, rowIndex) {
		row.forEach(function (cell, columnIndex) {
            if(cell == CELL_WALL){
                tile = new PIXI.Sprite(ICE_WALL_TEXTURE);
                tile.position.x = columnIndex * cellWidth;
                tile.position.y = rowIndex * cellWidth;
                tile.width = tile.height = cellWidth;

                terrain.addChild(tile);
			}
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

function drawEndpoints() {
    end1 = new PIXI.Sprite(ENDPOINT_TEXTURE);
    end2 = new PIXI.Sprite(ENDPOINT_TEXTURE);

    end1.position.x = endPositions[0][0] * cellWidth;
    end1.position.y = endPositions[0][1] * cellWidth;
    end2.position.x = endPositions[1][0] * cellWidth;
    end2.position.y = endPositions[1][1] * cellWidth;
    end1.width = end1.height = end2.width = end2.height = cellWidth;

    endpoints.addChild(end1);
    endpoints.addChild(end2);
}

function drawCells() {
	resetStage();

    cellWidth = Math.min(Math.floor(CANVAS_WIDTH/cells[0].length),
                         Math.floor(CANVAS_HEIGHT/cells.length))

	drawTerrain();
	drawUnits();
    drawEndpoints();
}

// determines whether or not a player is in motion
function inMotion() {
    return playerPositions[0][0]*cellWidth != units.children[0].x ||
           playerPositions[0][1]*cellWidth != units.children[0].y ||
           playerPositions[1][0]*cellWidth != units.children[1].x ||
           playerPositions[1][1]*cellWidth != units.children[1].y;
}

// Animate
animate();

function animate() {
	requestAnimationFrame(animate);

    if(units && playerPositions){
        var axdiff = playerPositions[0][0]*cellWidth - units.children[0].x;
        var aydiff = playerPositions[0][1]*cellWidth - units.children[0].y;
        var bxdiff = playerPositions[1][0]*cellWidth - units.children[1].x;
        var bydiff = playerPositions[1][1]*cellWidth - units.children[1].y;

        if(Math.abs(axdiff) > VELOCITY/2){
            units.children[0].x += axdiff > 0 ? VELOCITY : -VELOCITY;
        }else{
            units.children[0].x = playerPositions[0][0]*cellWidth;
        }

        if(Math.abs(aydiff) > VELOCITY/2){
            units.children[0].y += aydiff > 0 ? VELOCITY : -VELOCITY;
        }else{
            units.children[0].y = playerPositions[0][1]*cellWidth;
        }

        if(Math.abs(bxdiff) > VELOCITY/2){
            units.children[1].x += bxdiff > 0 ? VELOCITY : -VELOCITY;
        }else{
            units.children[1].x = playerPositions[1][0]*cellWidth;
        }

        if(Math.abs(bydiff) > VELOCITY/2){
            units.children[1].y += bydiff > 0 ? VELOCITY : -VELOCITY;
        }else{
            units.children[1].y = playerPositions[1][1]*cellWidth;
        }
    }

	renderer.render(stage);
}
