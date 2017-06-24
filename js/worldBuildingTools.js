tileTexture = new Array();
bmapTexture = new Array();
tempTexture = new Array();
bricks = new Array();
lights = new Array();
objNames = new Array();
liquidLayers = new Array();

function loadTextures() {
    newLevel = "loading";
    console.log("Loading new level textures begins");
    if(level[currentLevel].tilesets[0].img.complete){
        actualFunction();
        console.log("Loading new level textures completed");
    }

    function actualFunction() {
        var texturesLoaded = 0;
        var initialTextureLoaded = 0;
        for (var i = 0; i < level[currentLevel].tilesets.length; i++) {
            console.log("tileset[" + i + "] loaded = " +level[currentLevel].tilesets[0].img.complete);
            tileTexture[i] = new Array();
            for (var j = 0; j < level[currentLevel].tilesets[0].img.width / level[currentLevel].tilesets[0].tilewidth; j++) {
                for (var k = 0; k < level[currentLevel].tilesets[0].img.height / level[currentLevel].tilesets[0].tileheight; k++) {
                    tileTexture[i][j + k * (level[currentLevel].tilesets[0].img.width / level[currentLevel].tilesets[0].tilewidth)] = new THREE.TextureLoader().load(
                        // resource URL
                        cutImg(level[currentLevel].tilesets[0].img, level[currentLevel].tilesets[0].tilewidth * j, level[currentLevel].tilesets[0].tileheight * k, level[currentLevel].tilesets[0].tilewidth, level[currentLevel].tilesets[0].tileheight).src,
                        // Function when resource is loaded
                        function ( texture ) {
                            // do something with the texture
                            texture.magFilter = THREE.NearestFilter;
                            texture.minFilter = THREE.NearestFilter;
                            texture.wrapT = THREE.RepeatWrapping;
                            texture.wrapS = THREE.RepeatWrapping;

                            // // texture.repeat.set(level[currentLevel].tilesets[0].tilewidth / level[currentLevel].tilesets[0].img.width, level[currentLevel].tilesets[0].tileheight / level[currentLevel].tilesets[0].img.height);
                            // texture.repeat.x = 1 / (level[currentLevel].tilesets[0].img.width / level[currentLevel].tilesets[0].tilewidth);
                            // texture.repeat.y = 1 / (level[currentLevel].tilesets[0].img.height / level[currentLevel].tilesets[0].tileheight);
                            // texture.offset.x = texture.repeat.x * 0;
                            // texture.offset.y = texture.repeat.y * 6;
                            texturesLoaded++;
                            if (texturesLoaded >= level[currentLevel].tilesets[0].img.width / level[currentLevel].tilesets[0].tilewidth * level[currentLevel].tilesets[0].img.height / level[currentLevel].tilesets[0].tileheight)
                                JSONBuffer();
                        },
                        // Function called when download progresses
                        function ( xhr ) {
                            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
                        },
                        // Function called when download errors
                        function ( xhr ) {
                            console.error( 'COuld not load neccesary textures' );
                        }
                    );
                }
            }

            if (level[currentLevel].tilesets[0].bumpMap.complete){

                bmapTexture[i] = new Array();
                for (var j = 0; j < level[currentLevel].tilesets[0].bumpMap.width / level[currentLevel].tilesets[0].tilewidth; j++) {
                    for (var k = 0; k < level[currentLevel].tilesets[0].bumpMap.height / level[currentLevel].tilesets[0].tileheight; k++) {
                        bmapTexture[i][j + k * (level[currentLevel].tilesets[0].bumpMap.width / level[currentLevel].tilesets[0].tilewidth)] = new THREE.TextureLoader().load(
                            // resource URL
                            cutImg(level[currentLevel].tilesets[0].bumpMap, level[currentLevel].tilesets[0].tilewidth * j, level[currentLevel].tilesets[0].tileheight * k, level[currentLevel].tilesets[0].tilewidth, level[currentLevel].tilesets[0].tileheight).src,
                            // Function when resource is loaded
                            function ( texture ) {
                                // do something with the texture
                                texture.magFilter = THREE.NearestFilter;
                                texture.minFilter = THREE.NearestFilter;
                                texture.wrapT = THREE.RepeatWrapping;
                                texture.wrapS = THREE.RepeatWrapping;

                                // // texture.repeat.set(level[currentLevel].tilesets[0].tilewidth / level[currentLevel].tilesets[0].bumpMap.width, level[currentLevel].tilesets[0].tileheight / level[currentLevel].tilesets[0].bumpMap.height);
                                // texture.repeat.x = 1 / (level[currentLevel].tilesets[0].bumpMap.width / level[currentLevel].tilesets[0].tilewidth);
                                // texture.repeat.y = 1 / (level[currentLevel].tilesets[0].bumpMap.height / level[currentLevel].tilesets[0].tileheight);
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

        }
    }
}

function JSONBuffer() {
    // this is used so that the JSON texture fix (which applies different textures to different faces of a block) can be loaded, without executing any other during that
    loadJSON(level[currentLevel].tilesets[0].image.replace(".png", ".json"), "textureFix", logger);
    function logger() {
        console.log("now building world");
        buildBricks();
    }
}

function buildBricks() {
    liquidLayers = new Array();
    console.log(textureFix);

    var currentLayer = 0;
    var textureCount = 0;
    for (var k = 0; k < level[currentLevel].layers.length; k++) {

        // only go one more layer in front f the flag for a new layer is not set to false
        currentLayer++;
        if(typeof(level[currentLevel].layers[k].properties) !== "undefined"){
            if(typeof(level[currentLevel].layers[k].properties.flat) !== "undefined" ||
            typeof(level[currentLevel].layers[k].properties.light) !== "undefined" ||
            typeof(level[currentLevel].layers[k].properties.sameLayer) !== "undefined")
                currentLayer--;

            if (typeof(level[currentLevel].layers[k].properties.skipLayer) !== "undefined") {
                currentLayer += level[currentLevel].layers[k].properties.skipLayer;
            }

            if(typeof(level[currentLevel].layers[k].properties.liquid) !== "undefined")
                liquidLayers.push(k);
        }

        // this is used for tilemaps only
        if (level[currentLevel].layers[k].type == "tilelayer"){
            for (var j = 0; j < level[currentLevel].height; j++) {
                for (var i = 0; i < level[currentLevel].width; i++) {

                    // iterate from left to right, then top to bottom
                    // only render a block, if it has a value other than 0 or null.
                    if (level[currentLevel].layers[k].data[i + j*level[currentLevel].width] != 0 && level[currentLevel].layers[k].data[i + j*level[currentLevel].width] != undefined && isNaN(level[currentLevel].layers[k].data[i + j*level[currentLevel].width]) == false){
                        // This detects weather the block should be a flat plane or not
                        // It needs to be written like this otherwise there would be errors
                        var geometry = new THREE.CubeGeometry(blockSize + blockSize * blockVerticalTester(currentLevel, k, i, j),blockSize,blockSize /*, blockVerticalTester(currentLevel, k, i, j) + 1 */);
                        if(typeof(level[currentLevel].layers[k].properties) !== "undefined")
                            if(typeof(level[currentLevel].layers[k].properties.flat) !== "undefined")
                                var geometry = new THREE.PlaneGeometry( blockSize + blockSize * blockVerticalTester(currentLevel, k, i, j), blockSize );

                        tempTexture[textureCount] = _.cloneDeep(tileTexture[0][ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] -1 ]);
                        tempTexture[textureCount].repeat.set( blockVerticalTester(currentLevel, k, i, j) + 1, 1);

                        // only include a bumpMap, if bumpmaps were loaded
                        // to load bumpmaps, simply include a file called "xxx-bump.yyy" ie "textureName-bump.png"
                        if( typeof(bmapTexture[0]) !== "undefined" && useBumpMapping == true)
                            var material = new THREE.MeshPhongMaterial( { color: 0xffffff, map: tempTexture[textureCount] , transparent: true, bumpMap: bmapTexture[0][ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] -1 ]} );
                        else{
                            alphaTestValue = 0.5;
                            if (typeof textureFix != "undefined"){
                                if (typeof textureFix[ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] ] != "undefined"){
                                    // console.log("test");
                                    temp = {
                                        right : _.cloneDeep(tileTexture[0][textureFix[ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] ].right - 1]),
                                        left : _.cloneDeep(tileTexture[0][textureFix[ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] ].left - 1]),
                                        top : _.cloneDeep(tileTexture[0][textureFix[ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] ].top - 1]),
                                        bottom : _.cloneDeep(tileTexture[0][textureFix[ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] ].bottom - 1]),
                                        back : _.cloneDeep(tileTexture[0][textureFix[ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] ].back - 1]),
                                        front : _.cloneDeep(tileTexture[0][textureFix[ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] ].front - 1])
                                    }
                                    temp.right.repeat.set( blockVerticalTester(currentLevel, k, i, j) + 1, 1);
                                    temp.left.repeat.set( blockVerticalTester(currentLevel, k, i, j) + 1, 1);
                                    temp.top.repeat.set( blockVerticalTester(currentLevel, k, i, j) + 1, 1);
                                    temp.bottom.repeat.set( blockVerticalTester(currentLevel, k, i, j) + 1, 1);
                                    temp.back.repeat.set( blockVerticalTester(currentLevel, k, i, j) + 1, 1);
                                    temp.front.repeat.set( blockVerticalTester(currentLevel, k, i, j) + 1, 1);
                                    var material = new THREE.MultiMaterial([
                                        new THREE.MeshLambertMaterial( { color: 0xffffff, map: temp.right , transparent: true, alphaTest: alphaTestValue} ), // right
                                        new THREE.MeshLambertMaterial( { color: 0xffffff, map: temp.left , transparent: true, alphaTest: alphaTestValue} ), // left
                                        new THREE.MeshLambertMaterial( { color: 0xffffff, map: temp.top , transparent: true, alphaTest: alphaTestValue} ), // top
                                        new THREE.MeshLambertMaterial( { color: 0xffffff, map: temp.bottom , transparent: true, alphaTest: alphaTestValue} ), // bottom
                                        new THREE.MeshLambertMaterial( { color: 0xffffff, map: temp.back , transparent: true, alphaTest: alphaTestValue} ), // back
                                        new THREE.MeshLambertMaterial( { color: 0xffffff, map: temp.front , transparent: true, alphaTest: alphaTestValue} )  // front
                                    ]);
                                    // var material = new THREE.MeshLambertMaterial( { color: 0xffffff, map: tempTexture[textureCount] , transparent: true, alphaTest: alphaTestValue} );
                                }
                                else{
                                    var material = new THREE.MeshLambertMaterial( { color: 0xffffff, map: tempTexture[textureCount] , transparent: true, alphaTest: alphaTestValue} );
                                }
                            }else{
                                var material = new THREE.MeshLambertMaterial( { color: 0xffffff, map: tempTexture[textureCount] , transparent: true, alphaTest: alphaTestValue} );
                            }
                        }

                        textureCount++;

                        bricks[bricks.length] = new THREE.Mesh( geometry, material );
                        if(typeof(level[currentLevel].layers[k].properties) !== "undefined"){
                            if(typeof(level[currentLevel].layers[k].properties.flat) !== "undefined")
                                bricks[bricks.length-1].position.set(i * blockSize,- j * blockSize, currentLayer * blockSize + blockSize / 2 - blockSize * parseFloat(level[currentLevel].layers[k].properties.flat));
                            else
                                bricks[bricks.length-1].position.set(i * blockSize,- j * blockSize, currentLayer * blockSize);

                            if(typeof(level[currentLevel].layers[k].properties.light) !== "undefined"){
                                lights[lights.length] = new THREE.PointLight( level[currentLevel].layers[k].properties.lightColor, level[currentLevel].layers[k].properties.lightIntenisty, level[currentLevel].layers[k].properties.lightDistance, level[currentLevel].layers[k].properties.lightDecay );
                                lights[lights.length-1].position.set( i * blockSize,- j * blockSize, currentLayer * blockSize + blockSize );

                                lights[lights.length-1].castShadow = true;

                                scene.add( lights[lights.length-1] );

                                lights[lights.length] = new THREE.PointLight( level[currentLevel].layers[k].properties.lightColor, level[currentLevel].layers[k].properties.lightIntenisty, level[currentLevel].layers[k].properties.lightDistance, level[currentLevel].layers[k].properties.lightDecay );
                                lights[lights.length-1].position.set( i * blockSize,- j * blockSize, currentLayer * blockSize + blockSize / 2 );

                                lights[lights.length-1].castShadow = true;

                                scene.add( lights[lights.length-1] );
                            }
                        }else
                            bricks[bricks.length-1].position.set(i * blockSize,- j * blockSize, currentLayer * blockSize);

                        bricks[bricks.length-1].position.x += (blockVerticalTester(currentLevel, k, i, j) * blockSize) / 2;

                        if (typeof(level[currentLevel].layers[k].properties) !== "undefined"){
                            bricks[bricks.length-1].castShadow = false;
                        }else
                            bricks[bricks.length-1].castShadow = true;
                        bricks[bricks.length-1].receiveShadow = true;

                        scene.add(bricks[bricks.length-1]);
                    }
                    i+= blockVerticalTester(currentLevel, k, i, j);
                }
            }
        }
        if (level[currentLevel].layers[k].type == "objectgroup"){
            for (var i = 0; i < level[currentLevel].layers[k].objects.length; i++) {
                objNames[level[currentLevel].layers[k].objects[i].name] = new EntityID();
                if (level[currentLevel].layers[k].objects[i].type == "player"){
                    // quote = player = new EntityID();
                    // entityList[player.id] = new Entity(player.id, blockSize*level[currentLevel].width * 0.5, -blockSize*level[currentLevel].height *0.5, blockSize * 2, blockSize, blockSize, "img/chars/player.png")
                    // displayEntity(entityList[player.id], true);

                    // console.log(level[currentLevel].layers[k].objects[i].x + " | " + level[currentLevel].layers[k].objects[i].y + " | // | " + level[currentLevel].layers[k].objects[i].properties.img);
                    // console.log(objNames[level[currentLevel].layers[k].objects[i].name].id);
                    cameraDistance = level[currentLevel].layers[k].properties.z;
                    entityList[ objNames[level[currentLevel].layers[k].objects[i].name].id ] = new Entity(objNames[level[currentLevel].layers[k].objects[i].name].id, level[currentLevel].layers[k].objects[i].x / 2, -level[currentLevel].layers[k].objects[i].y / 2 + blockSize, blockSize * level[currentLevel].layers[k].properties.z, blockSize, blockSize, level[currentLevel].layers[k].objects[i].properties.img, 3);
                    camera.position.z = camera.position.z + blockSize * ( level[currentLevel].layers[k].properties.z - 3);
                    displayEntity( entityList[ objNames[level[currentLevel].layers[k].objects[i].name].id ] , true);

                    // entityList[objNames[level[currentLevel].layers[k].objects[i].name].id] = new Entity(objNames[level[currentLevel].layers[k].objects[i].name].id, level[currentLevel].layers[k].objects[i].x, -level[currentLevel].layers[k].objects[i].y, blockSize * 2, blockSize, blockSize, level[currentLevel].layers[k].objects[i].properties.img)
                }
                player = objNames[level[currentLevel].layers[k].properties.player];

                if (typeof statusHUD == "undefined" && typeof player.id != "undefined")
                    statusHUD = new PlayerHUD();
                // console.log(level[currentLevel].layers[k].objects[i].name);
            }
            if (typeof level[currentLevel].layers[k].properties !== "undefined"){
                if (typeof level[currentLevel].layers[k].properties.background !== "undefined"){
                    renderer.setClearColor(level[currentLevel].layers[k].properties.background, 1);
                    ambiLight = new THREE.AmbientLight( level[currentLevel].layers[k].properties.ambiColor, level[currentLevel].layers[k].properties.ambiStrengt ); // soft white light
                    scene.add( ambiLight );
                }else {
                    renderer.setClearColor(0x080808, 1);
                    ambiLight = new THREE.AmbientLight( 0x808080, 0.25 ); // soft white light
                    scene.add( ambiLight );
                }

            }
        }
    }

    newLevel = false;
}

function blockVerticalTester(levelID, layer, x, y){
    function boxRight(q) {return level[levelID].layers[layer].data[x + y * level[levelID].width + q];}

    var temp = 0;
    for (var l = 0; level[levelID].layers[layer].data[x + y * level[levelID].width] == boxRight(l+1) ; l++) {
        temp++;
    }
    return temp;
}

function loadJSON(url, varName, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback
            // as .open() will NOT return a value but simply returns undefined in asynchronous mode
            xobj.responseText
            window[varName] = JSON.parse(xobj.responseText);
            callback()
        }
    };
    xobj.send(null);
}
