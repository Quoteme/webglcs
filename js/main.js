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

newLevel = true; // true, false, "loading"
blockSize = 16;
shadowQuality = Math.pow(2, 11);
currentLevel = 0;
useBumpMapping = false;
entityShadows = false;
newLevelReloadBuffer = newLevelReloadTimer =  100; // this buffer counts down if the level is not loaded, and will try to reload the level after run down
loadingCounter = 0; // counts how long the game has been loaing
cameraDistance = 0;
multiplayer = true;
menuShown = true;
currentFrame = 0; // counts all frames that have been drawn

entityList = new Array();

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
        if(!newLevel){
            // update all entities collision, this is needed for the controles and gravity and stuff
            for (var i = 0; i < allCurrentEntities.length; i++) {
                entityList[allCurrentEntities[i]].collision = e2mCollision(entityList[allCurrentEntities[i]].position);
            }

            for (var i = 0; i < allCurrentEntities.length; i++) {
                moveEntity(allCurrentEntities[i])

                runFriction(entityList[allCurrentEntities[i]], 0.7, 0.9, 0.01, 2);
                if (entityList[allCurrentEntities[i]].gravity)
                    gravity(entityList[allCurrentEntities[i]], entityList[allCurrentEntities[i]].fallSpeed, 2);
                collisionStop(entityList[allCurrentEntities[i]]);
            }
            // console.log(entityList[player.id].collision);

            updateBullets();

            // only allow the movement if the player does not have the menu open
            if (!menuShown)
                controle(entityList[player.id]);

            focusEntity(entityList[player.id], camera, false, {"x":Math.abs(camera.position.x - entityList[player.id].position.x) * 0.05, "y":Math.abs(camera.position.y - entityList[player.id].position.y) * 0.05}, true);
            animateEntities();
        }
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

            // quote = player = new EntityID();
            // entityList[player.id] = new Entity(player.id, blockSize*level[currentLevel].width * 0.5, -blockSize*level[currentLevel].height *0.5, blockSize * 2, blockSize, blockSize, "img/chars/player.png")
            // displayEntity(entityList[player.id], true);
            //
            // curly = new EntityID();
            // entityList[curly.id] = new Entity(curly.id, blockSize*50, -blockSize*26, blockSize * 2, blockSize, blockSize, "img/chars/playerCurly.png")
            // displayEntity(entityList[curly.id], false);
            //
            // temp = new EntityID();
            // entityList[temp.id] = new Entity(temp.id, blockSize*47, -blockSize*26, blockSize * 2, blockSize, blockSize, "img/chars/playerB.png")
            // displayEntity(entityList[temp.id], false);
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
