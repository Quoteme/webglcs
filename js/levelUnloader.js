function unloadLevel(LevelName) {
    for (var i = 0; i < bricks.length; i++) {
        scene.remove( bricks[i] );
    }
    for (var i = 0; i < lights.length; i++) {
        scene.remove( lights[i] );
    }
    for (var i = 0; i < allCurrentEntities.length; i++) {
        scene.remove( entityList[allCurrentEntities[i]].mesh );
    }

    if (typeof statusHUD != "undefined"){
        removeHUD(statusHUD);
        delete statusHUD;
    }

	for (var i = 0; i < canvasLayer.length; i++) {
		scene.remove(canvasLayer[i].mesh);
	}

    if (typeof ambiLight !== "undefined" )
        scene.remove(ambiLight);
    allCurrentEntities = new Array();
    bricks = new Array(0);
    tileTexture = new Array(0);

    level[LevelName] = "";
    newLevel = "true";
    camera.position.set(0, 0, 150);
}

function changeLevel(level, slot) {
    loadLevel(level, slot);
    unloadLevel(currentLevel);

    currentLevel = slot;
}
