tileTexture = new Array();
bmapTexture = new Array();
tempTexture = new Array();
bricks = new Array();
lights = new Array();
objNames = new Array();
liquidLayers = new Array();
canvasLayer = new Object();
tiles = new Array();

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

    var currentLayer = 0;
    var textureCount = 0;

	if (options.generation.worldBuilder == "advanced") {
		advancedBuilder();
	}
	function advancedBuilder() {
		var tiles = classifyTiles();
		var layerInfo = classifyLayers();
		var currentLayer = 0;

		canvasLayer.front = new Array();
		canvasLayer.top = new Array();

		// front
		for (var i = 0; i < tiles.front.length; i++) {
			if (!is_in_array(i, layerInfo.sameLayer) && !is_in_array(i, layerInfo.flat)) {
				currentLayer++;
			}
			canvasLayer.front[i] = new textureCanvas(tiles.front[i]);
			canvasLayer.front[i].mesh.position.z = currentLayer * options.generation.blocksize + options.generation.blocksize / 2;
			if (is_in_array(i, layerInfo.flat)) {
				canvasLayer.front[i].mesh.position.z = currentLayer * options.generation.blocksize + options.generation.blocksize / 2 - level[currentLevel].layers[i].properties.flat * options.generation.blocksize;
			}
		}
		// top
		for (var i = 0; i < tiles.top.length; i++) {
			// canvasLayer.top[i] = new textureCanvas(tiles.top[i]);
			// canvasLayer.top[i].
		}
		function textureCanvas(chosenTiles){
			this.canvas = document.createElement("canvas");
			this.canvas.width = nextPowerOf2(options.generation.blocksize * level[currentLevel].width);
			this.canvas.height = nextPowerOf2(options.generation.blocksize * level[currentLevel].height);
			this.canvas.style.display = "none";
			this.ctx = this.canvas.getContext("2d");
			this.update = true;
			this.tiles = chosenTiles;
			console.log(this.tiles);
			this.draw = function(){
				this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
				for (var i = 0; i < this.tiles.length; i++) {
					this.ctx.drawImage(tileTexture[0][ this.tiles[i].img-1 ].image, this.tiles[i].x*options.generation.blocksize, this.tiles[i].y*options.generation.blocksize, options.generation.blocksize, options.generation.blocksize);
				}
				this.update = false;
			};
			this.texture = new THREE.CanvasTexture(this.canvas);
			this.texture.magFilter = THREE.NearestFilter;
			this.texture.minFilter = THREE.NearestFilter;
			this.texture.wrapT = THREE.RepeatWrapping;
			this.texture.wrapS = THREE.RepeatWrapping;
			this.material = new THREE.MeshBasicMaterial({map: this.texture, transparent: true});
			this.mesh = new THREE.Mesh( new THREE.PlaneGeometry(
                nextPowerOf2(options.generation.blocksize*level[currentLevel].width),
                nextPowerOf2(options.generation.blocksize*level[currentLevel].height),
                level[currentLevel].width, level[currentLevel].height), this.material
            );
			this.mesh.position.set(
                this.canvas.width / 2 - options.generation.blocksize / 2,
                -this.canvas.height / 2 + options.generation.blocksize / 2,
                options.generation.blocksize / 2
            );
			scene.add( this.mesh );
			function nextPowerOf2(n) {
				return nearestPowerOf2(n) * 2;
			}
			function nearestPowerOf2(n) {
				return 1 << 31 - Math.clz32(n);
			}
		}
	}

    for (var k = 0; k < level[currentLevel].layers.length; k++) {

        // only go one more layer in front if the flag for a new layer is not set to false
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
			if (options.generation.worldBuilder == "classic") {
				buildTileLayer(k);
			}
			function buildTileLayer(k) {
		            for (var j = 0; j < level[currentLevel].height; j++) {
		                for (var i = 0; i < level[currentLevel].width; i++) {

		                    // iterate from left to right, then top to bottom
		                    // only render a block, if it has a value other than 0 or null.
		                    if (level[currentLevel].layers[k].data[i + j*level[currentLevel].width] != 0 &&
                                level[currentLevel].layers[k].data[i + j*level[currentLevel].width] != undefined &&
                                isNaN(level[currentLevel].layers[k].data[i + j*level[currentLevel].width]) == false){
		                        // This detects weather the block should be a flat plane or not
		                        // It needs to be written like this otherwise there would be errors
		                        var geometry = new THREE.CubeGeometry(options.generation.blocksize + options.generation.blocksize * blockVerticalTester(currentLevel, k, i, j),options.generation.blocksize,options.generation.blocksize /*, blockVerticalTester(currentLevel, k, i, j) + 1 */);
		                        if(typeof(level[currentLevel].layers[k].properties) !== "undefined")
		                            if(typeof(level[currentLevel].layers[k].properties.flat) !== "undefined")
		                                var geometry = new THREE.PlaneGeometry( options.generation.blocksize + options.generation.blocksize * blockVerticalTester(currentLevel, k, i, j), options.generation.blocksize );

		                        tempTexture[textureCount] = _.cloneDeep(tileTexture[0][ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] -1 ]);
		                        tempTexture[textureCount].repeat.set( blockVerticalTester(currentLevel, k, i, j) + 1, 1);

		                        // only include a bumpMap, if bumpmaps were loaded
		                        // to load bumpmaps, simply include a file called "xxx-bump.yyy" ie "textureName-bump.png"
		                        if( typeof(bmapTexture[0]) !== "undefined" && options.generation.bumpMapping == true)
		                            var material = new THREE.MeshPhongMaterial( { color: 0xffffff, map: tempTexture[textureCount] , transparent: true, bumpMap: bmapTexture[0][ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] -1 ]} );
		                        else{
		                            alphaTestValue = 0.5;
		                            if (typeof textureFix != "undefined"){
		                                if (typeof textureFix.spriteFix[ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] ] != "undefined"){
		                                    console.log("----- test -----");
                                            console.log(tileTexture[0][textureFix.spriteFix[ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] ].right - 1]);
		                                    temp = {
		                                        right : _.cloneDeep(tileTexture[0][textureFix.spriteFix[ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] ].right - 1]),
		                                        left : _.cloneDeep(tileTexture[0][textureFix.spriteFix[ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] ].left - 1]),
		                                        top : _.cloneDeep(tileTexture[0][textureFix.spriteFix[ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] ].top - 1]),
		                                        bottom : _.cloneDeep(tileTexture[0][textureFix.spriteFix[ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] ].bottom - 1]),
		                                        back : _.cloneDeep(tileTexture[0][textureFix.spriteFix[ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] ].back - 1]),
		                                        front : _.cloneDeep(tileTexture[0][textureFix.spriteFix[ level[currentLevel].layers[k].data[i + j*level[currentLevel].width] ].front - 1])
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
		                                        new THREE.MeshLambertMaterial( { color: 0xffffff, map: temp.front , transparent: true, alphaTest: alphaTestValue} ), // back
		                                        new THREE.MeshLambertMaterial( { color: 0xffffff, map: temp.back , transparent: true, alphaTest: alphaTestValue} )  // front
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
								if (material.type != "MultiMaterial") {
									material.wireframe = options.generation.wireframe;
								}else {
									for (var g = 0; g < material.materials.length; g++) {
										material.materials[g].wireframe = options.generation.wireframe;
									}
								}

		                        textureCount++;

		                        bricks[bricks.length] = new THREE.Mesh( geometry, material );
		                        if(typeof(level[currentLevel].layers[k].properties) !== "undefined"){
		                            if(typeof(level[currentLevel].layers[k].properties.flat) !== "undefined")
		                                bricks[bricks.length-1].position.set(i * options.generation.blocksize,- j * options.generation.blocksize, currentLayer * options.generation.blocksize + options.generation.blocksize / 2 - options.generation.blocksize * level[currentLevel].layers[k].properties.flat);
		                            else
		                                bricks[bricks.length-1].position.set(i * options.generation.blocksize,- j * options.generation.blocksize, currentLayer * options.generation.blocksize);

		                            if(typeof(level[currentLevel].layers[k].properties.light) !== "undefined"){
		                                lights[lights.length] = new THREE.PointLight( level[currentLevel].layers[k].properties.lightColor, level[currentLevel].layers[k].properties.lightIntenisty, level[currentLevel].layers[k].properties.lightDistance, level[currentLevel].layers[k].properties.lightDecay );
		                                lights[lights.length-1].position.set( i * options.generation.blocksize,- j * options.generation.blocksize, currentLayer * options.generation.blocksize + options.generation.blocksize );

		                                lights[lights.length-1].castShadow = true;

		                                scene.add( lights[lights.length-1] );

		                                lights[lights.length] = new THREE.PointLight( level[currentLevel].layers[k].properties.lightColor, level[currentLevel].layers[k].properties.lightIntenisty, level[currentLevel].layers[k].properties.lightDistance, level[currentLevel].layers[k].properties.lightDecay );
		                                lights[lights.length-1].position.set( i * options.generation.blocksize,- j * options.generation.blocksize, currentLayer * options.generation.blocksize + options.generation.blocksize / 2 );

		                                lights[lights.length-1].castShadow = true;

		                                scene.add( lights[lights.length-1] );
		                            }
		                        }else
		                            bricks[bricks.length-1].position.set(i * options.generation.blocksize,- j * options.generation.blocksize, currentLayer * options.generation.blocksize);

		                        bricks[bricks.length-1].position.x += (blockVerticalTester(currentLevel, k, i, j) * options.generation.blocksize) / 2;

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
        }
        if (level[currentLevel].layers[k].type == "objectgroup"){
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
                // if the object layer stores entities, then create them
                if (typeof level[currentLevel].layers[k].properties.entityLayer !== "undefined"){
                    for (var i = 0; i < level[currentLevel].layers[k].objects.length; i++) {
                        objNames[level[currentLevel].layers[k].objects[i].name] = new EntityID();
                        if (level[currentLevel].layers[k].objects[i].visible){
                            // quote = player = new EntityID();
                            // entityList[player.id] = new Entity(player.id, options.generation.blocksize*level[currentLevel].width * 0.5, -options.generation.blocksize*level[currentLevel].height *0.5, options.generation.blocksize * 2, options.generation.blocksize, options.generation.blocksize, "img/chars/player.png")
                            // displayEntity(entityList[player.id], true);

                            // console.log(level[currentLevel].layers[k].objects[i].x + " | " + level[currentLevel].layers[k].objects[i].y + " | // | " + level[currentLevel].layers[k].objects[i].properties.img);
                            // console.log(objNames[level[currentLevel].layers[k].objects[i].name].id);
                            options.camera.distance.z = level[currentLevel].layers[k].properties.z;
                            entityList[ objNames[level[currentLevel].layers[k].objects[i].name].id ] = new Entity({
								"id": objNames[level[currentLevel].layers[k].objects[i].name].id,
								"position": {
									"x": level[currentLevel].layers[k].objects[i].x / 2,
									"y": -level[currentLevel].layers[k].objects[i].y / 2 + options.generation.blocksize,
									"z": options.generation.blocksize * level[currentLevel].layers[k].properties.z
								},
								"size":{
									"width": options.generation.blocksize,
									"height": options.generation.blocksize
								},
								"imgURL": level[currentLevel].layers[k].objects[i].properties.img,
								"health": 3,
                                "type": level[currentLevel].layers[k].objects[i].type,
                                "aiGroup": level[currentLevel].layers[k].objects[i].properties.aiGroup
                            },function (e) {
                                displayEntity( entityList[e.id],true);
                            });
                            camera.position.z = camera.position.z + options.generation.blocksize * ( level[currentLevel].layers[k].properties.z - 3);
                            // console.log(entityList[ objNames[level[currentLevel].layers[k].objects[i].name].id ]);
                            // displayEntity( entityList[ objNames[level[currentLevel].layers[k].objects[i].name].id ] , true);

                            // entityList[objNames[level[currentLevel].layers[k].objects[i].name].id] = new Entity(objNames[level[currentLevel].layers[k].objects[i].name].id, level[currentLevel].layers[k].objects[i].x, -level[currentLevel].layers[k].objects[i].y, options.generation.blocksize * 2, options.generation.blocksize, options.generation.blocksize, level[currentLevel].layers[k].objects[i].properties.img)
                        }
                        player = objNames[level[currentLevel].layers[k].properties.player];
						options.camera.focusEntity.entity = player.id;
						options.camera.focusEntity.use = true;

						if (typeof statusHUD == "undefined" && typeof player.id != "undefined")
                        statusHUD = new PlayerHUD();
                        // console.log(level[currentLevel].layers[k].objects[i].name);
                    }
                }
                // load the level specific code
                    // create the gameCode object
                    level[currentLevel].gameCode = new Object();
                // finally load the js file
                if (typeof level[currentLevel].layers[k].propertytypes !== "undefined") {
                    for (index in level[currentLevel].layers[k].propertytypes){
                        if ( level[currentLevel].layers[k].propertytypes[index] == "file"){
                            var jsLocation = document.getElementById('levelURL').value + level[currentLevel].layers[k].properties[index];
                            console.log( "external file detected: " + jsLocation);
                            loadScript(jsLocation, undefined);
                        }
                    }
                }
            }
        }
    }

    newLevel = "false";
}

function classifyTiles() {
	var tiles = new Object();
		tiles.front = new Array();
		tiles.left = new Array();
		tiles.right = new Array();
		tiles.top = new Array();
		tiles.bottom = new Array();
	// FRONT
	for (var z = 0; z < classifyLayers().tileLayer.length; z++) {
		tiles.front[z] = new Array();
		for (var x = 0; x < level[currentLevel].width; x++) {
			for (var y = 0; y < level[currentLevel].height; y++) {
				if (level[currentLevel].layers[z].data[x + y*level[currentLevel].width] != 0) {
					tiles.front[z].push({"x": x, "y":y, "z":z, "img": level[currentLevel].layers[z].data[x + y*level[currentLevel].width]});
				}
			}
		}
	}
	// TOP &
	// BOTTOM
	for (var y = 0; y < level[currentLevel].height; y++){
		tiles.top[y] = new Array();
		tiles.bottom[y] = new Array();
		for (var x = 0; x < level[currentLevel].width; x++) {
			for (var z = 0; z < classifyLayers().tileLayer.length; z++) {
				if (level[currentLevel].layers[z].data[x + y*level[currentLevel].width] == 0 && level[currentLevel].layers[z].data[x + (y-1)*level[currentLevel].width] != 0
					&& typeof level[currentLevel].layers[z].data[x + (y-1)*level[currentLevel].width] != "undefined" && typeof level[currentLevel].layers[z].data[x + y*level[currentLevel].width] != "undefined") {
					tiles.top[y].push({"x": x, "y":y, "z":z, "img": level[currentLevel].layers[z].data[x + (y-1)*level[currentLevel].width]});
				}
				if (level[currentLevel].layers[z].data[x + y*level[currentLevel].width] == 0 && level[currentLevel].layers[z].data[x + (y+1)*level[currentLevel].width] != 0
					&& typeof level[currentLevel].layers[z].data[x + (y+1)*level[currentLevel].width] != "undefined" && typeof level[currentLevel].layers[z].data[x + y*level[currentLevel].width] != "undefined") {
					tiles.bottom[y].push({"x": x, "y":y, "z":z, "img": level[currentLevel].layers[z].data[x + (y+1)*level[currentLevel].width]});
				}
			}
		}
	}
	// LEFT &
	// RIGHT
	for (var x = 0; x < level[currentLevel].width; x++) {
		tiles.left[x] = new Array();
		tiles.right[x] = new Array();
		for (var y = 0; y < level[currentLevel].height; y++) {
			for (var z = 0; z < classifyLayers().tileLayer.length; z++){
				if (level[currentLevel].layers[z].data[x + y*level[currentLevel].width] == 0 && level[currentLevel].layers[z].data[x+1 + y*level[currentLevel].width] != 0
					&& typeof level[currentLevel].layers[z].data[x + y*level[currentLevel].width] != "undefined" && typeof level[currentLevel].layers[z].data[x+1 + y*level[currentLevel].width] != "undefined") {
					tiles.left[x].push({"x": x, "y":y, "z":z, "img": level[currentLevel].layers[z].data[x+1 + y*level[currentLevel].width]});
				}
				if (level[currentLevel].layers[z].data[x + y*level[currentLevel].width] == 0 && level[currentLevel].layers[z].data[x-1 + y*level[currentLevel].width] != 0
					&& typeof level[currentLevel].layers[z].data[x + y*level[currentLevel].width] != "undefined" && typeof level[currentLevel].layers[z].data[x-y + y*level[currentLevel].width] != "undefined") {
					tiles.right[x].push({"x": x, "y":y, "z":z, "img": level[currentLevel].layers[z].data[x-1 + y*level[currentLevel].width]});
				}
			}
		}
	}
	return tiles;
}

function classifyLayers(){
	var layerTypes = new Object();
		layerTypes.normal = new Array();
		layerTypes.flat = new Array();
		layerTypes.light = new Array();
		layerTypes.sameLayer = new Array();
		layerTypes.skipLayer = new Array();
		layerTypes.liquid = new Array();
		layerTypes.entity = new Array();
		layerTypes.tileLayer = new Array();
		layerTypes.collision = {min: undefined, max: undefined, layers:[]};
	for (var k = 0; k < level[currentLevel].layers.length; k++) {
		if(typeof(level[currentLevel].layers[k].properties) !== "undefined"){
			if(typeof(level[currentLevel].layers[k].properties.flat) !== "undefined"){
				layerTypes.flat.push(k);
			}
			if(typeof level[currentLevel].layers[k].properties.light !== "undefined"){
				layerTypes.light.push(k);
			}
			if(typeof level[currentLevel].layers[k].properties.sameLayer !== "undefined"){
				layerTypes.sameLayer.push(k);
			}
			if(typeof level[currentLevel].layers[k].properties.skipLayer !== "undefined"){
				layerTypes.skipLayer.push(k);
			}
			if(typeof level[currentLevel].layers[k].properties.liquid !== "undefined"){
				layerTypes.liquid.push(k);
			}
			if(typeof level[currentLevel].layers[k].properties.collision !== "undefined"){
				if (typeof layerTypes.collision.min == "undefined" || layerTypes.collision.min >= level[currentLevel].layers[k].properties.collision) {
					layerTypes.collision.min = level[currentLevel].layers[k].properties.collision;
				}
				if (typeof layerTypes.collision.max == "undefined" || layerTypes.collision.max <= level[currentLevel].layers[k].properties.collision) {
					layerTypes.collision.max = level[currentLevel].layers[k].properties.collision;
				}
				layerTypes.collision.layers.push(k);
			}
		}else{
			layerTypes.normal.push(k);
		}
		if (level[currentLevel].layers[k].type == "tilelayer") {
			layerTypes.tileLayer.push(k);
		}else {
			layerTypes.entity.push(k);
		}
	}
	return layerTypes;
}

function blockVerticalTester(levelID, layer, x, y){
	if (options.generation.boxCulling == true) {
	    function boxRight(q) {return level[levelID].layers[layer].data[x + y * level[levelID].width + q];}

	    var temp = 0;
	    for (var l = 0; level[levelID].layers[layer].data[x + y * level[levelID].width] == boxRight(l+1) ; l++) {
	        temp++;
	    }
	}else {
		temp = 0;
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

function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

function findByProperty(arr, property, name) {
    foundAt = new Array();
    for (var i = 0; i < arr.length; i++) {
        if (arr[i][property] == name) {
            foundAt[foundAt.length] = i;
        }
    }
    return foundAt;
}

function is_in_array(s,your_array) {
    for (var i = 0; i < your_array.length; i++) {
        if (your_array[i] === s) return true;
    }
    return false;
}

function boxtest() {
	for (var i = 0; i < bricks.length; i++) {
		if (bricks[i].material.type != "MeshLambertMaterial") {
			console.log(i);
		}
	}
}
