var scene = new THREE.Scene();

camera = new THREE.CombinedCamera( window.innerWidth / 4, window.innerHeight / 4, 75, 1, 1000, - 500, 1000 );

// var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
// width = window.innerWidth / 5;
// height = window.innerHeight / 5;
// var camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.sortObjects = true;
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0x080808, 1);
document.body.appendChild( renderer.domElement );
options = {
	"camera": {
		"orthograpic": {
			"marginTop": 2,
			"marginLeft": 0
		},
		"perspective":{
			"marginTop": 2,
			"marginLeft": 0
		},
		"distance":{
			"x": 0,
			"y": 0,
			"z": 0
		},
		"focusEntity":{
			"use": false,
			"entity": 0
		},
		"zoom": 100
	},
	"collision":{
		"frontBackErrorMargin": 0.1
	},
	"generation":{
		"worldBuilder": "classic",
		"boxCulling": true,
		"blocksize": 16,
		"bumpMapping": false,
		"entityShadows": false,
		"shadowQuality": 11,
		"wireframe": false
	},
	"multiplayer":{
		"singleplayer": false
	}
}

newLevel = true; // true, false, "loading"
currentLevel = 0;
newLevelReloadBuffer = newLevelReloadTimer =  100; // this buffer counts down if the level is not loaded, and will try to reload the level after run down
loadingCounter = 0; // counts how long the game has been loaing
menuShown = true;
currentFrame = 0; // counts all frames that have been drawn
worldBuilder = "classic"; // advanced

entityList = new Object();

init();
animate();

function init() {
    var geometry = new THREE.BoxGeometry( 32, 32, 32 );
    var material = new THREE.MeshBasicMaterial( { color: 0x4f304f} );
    loadingCube = new THREE.Mesh( geometry, material );
    scene.add( loadingCube );

    camera.position.z = 150;
}

function animate() {
    function update() {
        // ------------- LOADED -------------
        if(!newLevel){
            // collision update
            for (var i = 0; i < allCurrentEntities.length; i++) {
                entityList[allCurrentEntities[i]].collision = e2mCollision(entityList[allCurrentEntities[i]].position);
            }
            // player movement
            for (var i = 0; i < allCurrentEntities.length; i++) {
                moveEntity(allCurrentEntities[i])
                runFriction(entityList[allCurrentEntities[i]], 0.7, 0.9, 0.01, 2);
                if (entityList[allCurrentEntities[i]].gravity)
                    gravity(entityList[allCurrentEntities[i]], entityList[allCurrentEntities[i]].fallSpeed, 2);
                collisionStop(entityList[allCurrentEntities[i]]);
            }
            // update Bullets
            updateBullets();
            updateBulletCollision();

            // only allow the movement if the player does not have the menu open
            if (!menuShown)
                controle(entityList[player.id]);

			if (options.camera.focusEntity.use) {
	            focusEntity(entityList[options.camera.focusEntity.entity], {"x":Math.abs(camera.position.x - entityList[player.id].position.x) * 0.05, "y":Math.abs(camera.position.y - entityList[player.id].position.y) * 0.05}, true);
			}
            animateEntities();

            // level specific script
            if (typeof level[currentLevel].gameCode.update != "undefined") {
                level[currentLevel].gameCode.update();
            }
        }
        // ------------- NOT LOADED -------------
        else{
            if (newLevel == true)
                loadTextures();
            if (newLevel == "loading"){
                console.log("loading buffer fills");
                if (newLevelReloadTimer < 0) {
                    changeLevel(level[currentLevel].url, currentLevel);
                    console.log("trying to reload level");
                    newLevelReloadTimer = newLevelReloadBuffer;
                }
                else {
                    newLevelReloadTimer--;
                }
            }
        }
        currentFrame++;
    }

    function loadScreen(){
        loadingCube.visible = true;
        loadingCube.rotation.y += 0.05;
        loadingCube.rotation.x += 0.05;
        loadingCube.rotation.z += 0.01;
        loadingCounter++;
        // console.log("loading");
    }

    var render = function () {
        if(typeof level[currentLevel] !== "undefined"){
            if (level[currentLevel].loaded) {
                update();
            }
            else {
                loadScreen();
            }
        }
        else {
            loadScreen();
        }

		if (worldBuilder == "advanced" && newLevel == false) {
			for (var v in canvasLayer) {
				if (canvasLayer.hasOwnProperty(v)) {
					for (var i = 0; i < canvasLayer[v].length; i++) {
						if (canvasLayer[v][i].update) {
							canvasLayer[v][i].draw();
						}
					}
				}
			}
		}

        renderer.render(scene, camera);
        requestAnimationFrame( render );
    };

    render();
}

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
