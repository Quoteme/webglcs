loadLevel("levels/level1.txt", 0);
var keyboard = new THREEx.KeyboardState();
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
// width = window.innerWidth / 3;
// height = window.innerHeight / 3;
// var camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0x333333, 1);
document.body.appendChild( renderer.domElement );

newLevel = true;
blockSize = 16;
shadowQuality = Math.pow(2, 11);
currentLevel = 0;

init();
animate();

function init() {
    var hemiLight = new THREE.DirectionalLight( 0xffffbb, 0.5 );
    hemiLight.position.y = 1000;
    hemiLight.position.z = 500;
    hemiLight.castShadow = true;
    scene.add( hemiLight );

    var spotLight = new THREE.SpotLight( 0xffffff,0.5 );
    spotLight.position.set( 0, 200, 200);
    spotLight.lookAt(0,0,0);

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = shadowQuality;
    spotLight.shadow.mapSize.height = shadowQuality;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;

    spotLight.angle = 1;
    spotLight.penumbra = 0.3;
    // spotLight.distance = 1000;

    scene.add( spotLight );

    camera.position.z = 300;
}

function animate() {
    function update() {
        if(!newLevel){
            controles();
        }
        else{
            tileTexture = new Array();
            for (var i = 0; i < level[currentLevel].tilesets.length; i++) {
                tileTexture[i] = new Array();
                for (var j = 0; j < level[currentLevel].tilesets[0].img.width / level[currentLevel].tilesets[0].width; j++) {
                    for (var k = 0; k < level[currentLevel].tilesets[0].img.height / level[currentLevel].tilesets[0].height; k++) {
                        tileTexture[i][j + k * (level[currentLevel].tilesets[0].img.width / level[currentLevel].tilesets[0].width)] = new THREE.TextureLoader().load(
                            // resource URL
                            cutImg(level[currentLevel].tilesets[0].img, level[currentLevel].tilesets[0].width * j, level[currentLevel].tilesets[0].height * k, level[currentLevel].tilesets[0].width, level[currentLevel].tilesets[0].height).src,
                            // Function when resource is loaded
                            function ( texture ) {
                                // do something with the texture
                                texture.magFilter = THREE.NearestFilter;
                                texture.minFilter = THREE.NearestFilter;
                                texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;

                                // // texture.repeat.set(level[currentLevel].tilesets[0].width / level[currentLevel].tilesets[0].img.width, level[currentLevel].tilesets[0].height / level[currentLevel].tilesets[0].img.height);
                                // texture.repeat.x = 1 / (level[currentLevel].tilesets[0].img.width / level[currentLevel].tilesets[0].width);
                                // texture.repeat.y = 1 / (level[currentLevel].tilesets[0].img.height / level[currentLevel].tilesets[0].height);
                                // texture.offset.x = texture.repeat.x * 0;
                                // texture.offset.y = texture.repeat.y * 6;
                            },
                            // Function called when download progresses
                            function ( xhr ) {
                                console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
                            },
                            // Function called when download errors
                            function ( xhr ) {
                                console.log( 'An error happened' );
                            }
                        );
                    }
                }


            }
            bricks = new Array();

            for (var k = 0; k < level[currentLevel].layer.length; k++) {

                for (var i = -1; i < level[currentLevel].header.width - 1; i++) {
                    for (var j = 0; j < level[currentLevel].header.height; j++) {
                        if (level[currentLevel].layer[k][i + j*level[currentLevel].header.height] != 0 && level[currentLevel].layer[k][i + j*level[currentLevel].header.height] != undefined && isNaN(level[currentLevel].layer[k][i + j*level[currentLevel].header.height]) == false){
                            var geometry = new THREE.CubeGeometry(blockSize,blockSize,blockSize);
                		    var material = new THREE.MeshLambertMaterial( { color: 0xffffff, map: tileTexture[0][ level[currentLevel].layer[k][i + j*level[currentLevel].header.height] -1 ] , transparent: true } );

                            bricks[bricks.length] = new THREE.Mesh( geometry, material );
                            bricks[bricks.length-1].position.set(i * blockSize - level[currentLevel].header.width / 2 * blockSize,- j * blockSize + level[currentLevel].header.height / 2 * blockSize, k * blockSize);
                            //( - i * blockSize, - j * blockSize, k * blockSize)
                            // if (k != 0)
                            bricks[bricks.length-1].castShadow = true;
                            bricks[bricks.length-1].receiveShadow = true;

                            scene.add(bricks[bricks.length-1]);
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
        if(level[currentLevel].loaded){
            update();
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
