loadLevel("levels/level1.txt", 0);
var keyboard = new THREEx.KeyboardState();


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;
document.body.appendChild( renderer.domElement );

newLevel = true;
blockSize = 32;

var geometry = new THREE.BoxGeometry( blockSize, blockSize, blockSize );
var material = new THREE.MeshPhongMaterial( { color: 0x80ff80 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

var hemiLight = new THREE.DirectionalLight( 0xffffbb, 0.5 );
hemiLight.position.y = 1000;
hemiLight.position.z = 500;
hemiLight.castShadow = true;
hemiLight.lookAt(0,0,0);
scene.add( hemiLight );

var spotLight = new THREE.SpotLight( 0xffffff,0.5 );
spotLight.position.set( 0, 500, 300 );

spotLight.castShadow = true;

spotLight.target.position.set(-1, 0, 1 );
spotLight.shadowDarkness = 0.5;

spotLight.shadow.mapSize.width = Math.pow(2, 10);
spotLight.shadow.mapSize.height = Math.pow(2, 10);

spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 100;

spotLight.lookAt(0,0,0)

scene.add( spotLight );

camera.position.z = 500;

function update() {
    if(!newLevel){
        controles();
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }
    else{
        bricks = new Array();

        for (var k = 0; k < level[0].layer.length; k++) {

            for (var i = -1; i < level[0].header.width - 1; i++) {
                for (var j = 0; j < level[0].header.height; j++) {
                    if (level[0].layer[k][i + j*level[0].header.height] != 0 && level[0].layer[k][i + j*level[0].header.height] != undefined && isNaN(level[0].layer[k][i + j*level[0].header.height]) == false ){
                        bricks[bricks.length] = new Object();
                        bricks[bricks.length-1].cube = new THREE.Mesh( geometry, material );
                        bricks[bricks.length-1].cube.position.set(- i * blockSize, - j * blockSize, k * blockSize);
                        bricks[bricks.length-1].cube.castShadow = true;
                        bricks[bricks.length-1].cube.receiveShadow = true;
                        scene.add(bricks[bricks.length-1].cube);
                    }
                }
            }

        }

        newLevel = false;

    }
}

function loadScreen(){
    console.log("loading...");
}

var render = function () {
    if(level[0].loaded){
        update();
    }
    else {
        loadScreen();
    }

    renderer.render(scene, camera);

    requestAnimationFrame( render );
};

render();
