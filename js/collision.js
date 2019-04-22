// entity to entity collision detection
function e2eCollision(e1, e2){
    var collisionDetected = false;

    // find minimal and maximal values of x y and z from both objects
    // the function at the end determines if < or > should be used (min or max value should be returned)
    min1 = getLimit(e1, function(a, b){ return a < b});
    max1 = getLimit(e1, function(a, b){ return a > b});
    min2 = getLimit(e2, function(a, b){ return a < b});
    max2 = getLimit(e2, function(a, b){ return a > b});

    function getLimit(e, compare) {
        v = e.geometry.vertices;
        tempLimit = {
            "x" : v[0].x,
            "y" : v[0].y,
            "z" : v[0].z
        }
        for (var i = 0; i < v.length; i++) {
            if (compare(v[i].x, tempLimit.x)) {
                tempLimit.x = v[i].x;
            }
            if (compare(v[i].y, tempLimit.y)) {
                tempLimit.y = v[i].y;
            }
            if (compare(v[i].z, tempLimit.z)) {
                tempLimit.z = v[i].z;
            }
        }
        tempLimit.x += e.position.x;
        tempLimit.y += e.position.y;
        tempLimit.z += e.position.z;
        return tempLimit;
    }

    // actual collision detection, just like with normal squares
    // z currently not implemented
    if (min1.x > min2.x && min1.x < max2.x &&
        min1.y > min2.y && min1.y < max2.y ||
        min2.x > min1.x && min2.x < max1.x &&
        min2.y > min1.y && min2.y < max1.y) {
            collisionDetected = true;
    }
    return collisionDetected;
}

// entity to map collsion detection
// TODO: rewrite collision
function e2mCollision(ePos={"x":0,"y":0,"z":0},eSize={"x":16,"y":16}) {
    // size of every object in the z axis (this is the distance in
    // front/back of an entity, when a collision should be checked for)
        var depth = 5;
    // initialize return values
        var collision = {
            "top":          0,
            "bottom":       0,
            "left":         0,
            "right":        0,
            "inside":       0,
            "behind":       0,
            "front":        0,
            "outOfBounds":  0,
            "bounce":       0,
            "liquid":       0
        }
    // out of bounds detection
        if (ePos.x < -options.generation.blocksize/2||
            ePos.x > level[0].width*options.generation.blocksize-options.generation.blocksize/2||
            ePos.y > 0 ||
            ePos.y < -level[0].height*options.generation.blocksize||
            ePos.z < 0) {
            collision.outOfBounds = true;
        }
    // stop here if out of bounds
        if (collision.outOfBounds) {
            return collision;
        }
    // find values for the edges of the entity
        var e = {
            "ctr": {"x":ePos.x+eSize.x/2,"y":ePos.y+eSize.y/2}, // inside
            "top": {"y":ePos.y+eSize.y},                        // top
            "btm": {"y":ePos.y-1-(-16+eSize.y)/2},              // bottom
            "lft": {"x":ePos.x-0.01,},                          // left
            "rgt": {"x":ePos.x+eSize.x+0.01}                    // right
        }
    // actually detect collisions
        var layerinfo = classifyLayers();
        // parse through all layers
            for (var k = 0; k < layerinfo.collision.layers.length; k++) {
                // reference the layers in a more compact variable name
                    var layer = level[currentLevel].layers[layerinfo.collision.layers[k]];
                // do not check layers that are on a different z position than the entity
                    if ( layer.properties.collision != Math.round(ePos.z/options.generation.blocksize) ) {
                        continue
                    }
                // actual collision detection
                    if (collision.top==0) {
                        collision.top = blockAtPos(
                            layer,
                            Math.floor(e.ctr.x/options.generation.blocksize),
                            Math.floor(e.top.y/options.generation.blocksize)*(-1)
                        );
                    }
                    if (collision.bottom==0) {
                        collision.bottom = blockAtPos(
                            layer,
                            Math.floor(e.ctr.x/options.generation.blocksize),
                            Math.floor(e.btm.y/options.generation.blocksize)*(-1)
                        );
                    }
                    if (collision.right==0) {
                        collision.right = blockAtPos(
                            layer,
                            Math.floor(e.rgt.x/options.generation.blocksize),
                            Math.floor(e.ctr.y/options.generation.blocksize)*(-1)
                        );
                    }
                    if (collision.left==0) {
                        collision.left = blockAtPos(
                            layer,
                            Math.floor(e.lft.x/options.generation.blocksize),
                            Math.floor(e.ctr.y/options.generation.blocksize)*(-1)
                        );
                    }
                    if (collision.inside==0) {
                        collision.inside = blockAtPos(
                            layer,
                            Math.floor(e.ctr.x/options.generation.blocksize),
                            Math.floor(e.ctr.y/options.generation.blocksize)*(-1)
                        );
                    }
                    // check if a (collsion-) layer in the back of the entity exists
                        if (layerinfo.collision.layers.includes(Math.round((entityList[player.id].position.z-depth)/16))&&
                            Math.round((entityList[player.id].position.z-depth)/16)!=layer.properties.collision) {
                            // console.log("lal!!!");
                            var backlayer = level[currentLevel].layers[Math.round((entityList[player.id].position.z-depth)/16)];
                        }else {
                            var backlayer = layer;
                        }
                    // check if a (collsion-) layer in front of the entity exists
                        var distanceToBehindBlock = (ePos.z-options.generation.blocksize/2)%options.generation.blocksize;
                        //
                        if (collision.behind == 0 && typeof layerinfo.collision.layers[k-1] != "undefined" &&
    					    distanceToBehindBlock <= options.collision.frontBackErrorMargin) {
    						collision.behind = level[currentLevel].layers[
                                layerinfo.collision.layers[k-1]].data[
                                    Math.floor(e.ctr.x/options.generation.blocksize) +
                                    Math.floor(e.ctr.y/options.generation.blocksize)*(-1) * level[currentLevel].width
                                ];
    					}
                        if (collision.front == 0 && typeof layerinfo.collision.layers[k+1] != "undefined" &&
    					    options.generation.blocksize-distanceToBehindBlock <= options.collision.frontBackErrorMargin) {
    						collision.front = level[currentLevel].layers[
                                layerinfo.collision.layers[k+1]].data[
                                    Math.floor(e.ctr.x/options.generation.blocksize) +
                                    Math.floor(e.ctr.y/options.generation.blocksize)*(-1) * level[currentLevel].width
                                ];
    					}
            }
        return collision;
}
// function to evaluate what block is at position (x,y) in layer p
function blockAtPos(pLayer, x,y) {
    return pLayer.data[
        x +
        y * level[currentLevel].width
    ];
}
// this is a backup for what do I know what
// function e2mCollision(entity_position,width,heigh) {
//     // returns information about weather an entity collides with the map (left/right/top/etc)
//     collision = new Object();
//     collision.top = 0;
//     collision.bottom = 0;
//     collision.left = 0;
//     collision.right = 0;
//     collision.inside = 0;
// 	collision.behind = 0;
// 	collision.front = 0;
//     collision.outOfBounds = false;
//     collision.bounce = 0.2;
//     collision.liquid = 0;
//     collision.position = {
//         "round" : {
//             x : function(offset){ return Math.round((entity_position.x + offset) / options.generation.blocksize) },
//             y : function(offset){ return -1 * Math.round((entity_position.y + offset) / options.generation.blocksize) }
//         },
//         "floor" : {
//             x : function(offset){ return Math.floor((entity_position.x + offset) / options.generation.blocksize) },
//             y : function(offset){ return -1 * Math.floor((entity_position.y + offset) / options.generation.blocksize) - 1 }
//         }
//     };
//     if (entity_position.x<-options.generation.blocksize/2||
//         entity_position.x>level[0].width*options.generation.blocksize-options.generation.blocksize/2||
//         entity_position.y>0 ||
//         entity_position.y<-level[0].height*options.generation.blocksize||
//         entity_position.z<0) {
//         collision.outOfBounds = true;
//     }
//     if (!collision.outOfBounds){
//             // cycle thtrough all layers
// 			var layerinfo = classifyLayers();
//             for (var k = 0; k < layerinfo.collision.layers.length; k++) {
//                 // only look for collisions, if the layer is at the same z position as the entity
// 				if(level[currentLevel].layers[layerinfo.collision.layers[k]].properties.collision == Math.round((entity_position.z+options.generation.blocksize/4) / options.generation.blocksize)){
// 					if (collision.inside == 0) {
// 						collision.inside = level[currentLevel].layers[layerinfo.collision.layers[k]].data[collision.position.round.x(0) + collision.position.round.y(0) * level[currentLevel].width];
// 					}
// 					if (collision.left == 0) {
// 						collision.left = level[currentLevel].layers[layerinfo.collision.layers[k]].data[collision.position.floor.x(0) + collision.position.round.y(0) * level[currentLevel].width];
// 					}
// 					if (collision.right == 0) {
// 						collision.right = level[currentLevel].layers[layerinfo.collision.layers[k]].data[collision.position.floor.x(0) +1 + collision.position.round.y(0) * level[currentLevel].width];
// 					}
// 					if (collision.top == 0) {
// 						collision.top = level[currentLevel].layers[layerinfo.collision.layers[k]].data[collision.position.round.x(0) + collision.position.floor.y(0) * level[currentLevel].width];
// 					}
// 					if (collision.bottom == 0) {
// 						collision.bottom = level[currentLevel].layers[layerinfo.collision.layers[k]].data[collision.position.round.x(0) + (collision.position.floor.y(0) +1)*level[currentLevel].width];
// 					}
//                     var distanceToBehindBlock = (entity_position.z / options.generation.blocksize)%1-1/4;
//                     if (distanceToBehindBlock < 0) {
//                         distanceToBehindBlock++;
//                     }
//                     if (collision.behind == 0 && typeof layerinfo.collision.layers[k-1] != "undefined" &&
// 					    distanceToBehindBlock <= options.collision.frontBackErrorMargin) {
// 						collision.behind = level[currentLevel].layers[layerinfo.collision.layers[k-1]].data[collision.position.round.x(0) + collision.position.round.y(0) * level[currentLevel].width];
// 					}
// 					if (collision.front == 0 && typeof layerinfo.collision.layers[k+1] != "undefined" &&
// 						distanceToBehindBlock >= 1-options.collision.frontBackErrorMargin) {
// 						collision.front = level[currentLevel].layers[layerinfo.collision.layers[k+1]].data[collision.position.round.x(0) + collision.position.round.y(0) * level[currentLevel].width];
// 					}
//                     if (typeof liquidLayers != "undefined"){
//                         if (liquidLayers.length == 0)
//                             collision.liquid = 0;
//                         else
//                         for (var p = 0; p < liquidLayers.length; p++) {
//                             if (level[currentLevel].layers[liquidLayers[p]].data[Math.round(entity_position.x / options.generation.blocksize) + -1 *Math.round((entity_position.y - 6) / options.generation.blocksize)*level[currentLevel].width] != 0)
//                                 collision.liquid = parseFloat(level[currentLevel].layers[liquidLayers[p]].properties.liquid);
//                             else
//                                 collision.liquid = 0;
//                         }
//                     }else {
//                         collision.liquid = 0;
//                     }
//                 }
//
//             }
//             if (level[currentLevel].width * level[currentLevel].tilewidth - entity_position.x * 2 < level[currentLevel].tilewidth) {
//                 collision.right = 0;
//             }
//             if (level[currentLevel].height * level[currentLevel].tileheight - entity_position.y * 2 < level[currentLevel].tileheight) {
//                 collision.bottom = 0;
//             }
//     }else{
//         // entity is out of bounds
//         collision.top = 0;
//         collision.bottom = 0;
//         collision.left = 0;
//         collision.right = 0;
//         collision.inside = 0;
// 		collision.behind = 0;
// 		collision.front = 0;
//         collision.liquid = 0;
//         collision.outOfBounds = true;
//     }
//     if (typeof collision.bottom == "undefined") {
//         collision.bottom = 0;
//     }
//     return collision;
// }

function updateBulletCollision() {
    for (var i = 0; i < localBullets.length; i++) {
        for (var j = 0; j < allCurrentEntities.length; j++) {
            if (allCurrentEntities[j] != localBullets[i].owner) {
                if ( e2eCollision(localBullets[i].mesh, entityList[allCurrentEntities[j]].mesh) ) {
                    if (localBullets[i].props.collision.counter >= 0){
                        localBullets[i].props.collision.counter--;
                        entityList[allCurrentEntities[j]].health -= localBullets[i].props.damage;
                    }
                }
            }
        }
        for (prop in minifiedEntityList) {
            if (e2eCollision(localBullets[i].mesh, minifiedEntityList[prop].mesh)) {
                if (localBullets[i].props.collision.counter >= 0){
                    localBullets[i].props.collision.counter--;
                    angle = new Object();
                    console.log(localBullets[i].mesh.rotation.z);
                    angle.x = -1 * Math.cos(localBullets[i].mesh.rotation.z);//minifiedEntityList[prop].mesh.position.y - localBullets[i].mesh.position.y;
                    angle.y = -1 * Math.sin(localBullets[i].mesh.rotation.z);//minifiedEntityList[prop].mesh.position.x - localBullets[i].mesh.position.x;
                    socket.emit("weaponDamage", {"damage": localBullets[i].props.damage, "victim": prop, "attacker": ownNetworkID, "angle" : angle, "speed": localBullets[i].props.speed } );
                }
            }
        }
    }
}

function runFriction(entity, friction, airResistance, minimalVelocity, terminalVelocity) {
    // console.log(entity.velocity.x);
    if (entity.collision.bottom == 0)
        friction = airResistance;

    entity.velocity.x = entity.velocity.x * friction;
    if ( Math.abs(entity.velocity.x) <= minimalVelocity ){
        entity.velocity.x = 0;
    }
    if ( Math.abs(entity.velocity.x) >= terminalVelocity ) {
        entity.velocity.x = Math.sign(entity.velocity.x) * terminalVelocity;
    }
	entity.velocity.z = entity.velocity.z * friction;
    if ( Math.abs(entity.velocity.z) <= minimalVelocity ){
        entity.velocity.z = 0;
    }
    if ( Math.abs(entity.velocity.z) >= terminalVelocity ) {
        entity.velocity.z = Math.sign(entity.velocity.z) * terminalVelocity;
    }
    // friction * entity.collision.liquid;
    // if (entity.collision.bottom == 0) {
    //     friction /= 4;
    // }
    // if (entity.velocity.x > 0)
    //     entity.velocity.x -= friction;
    // if (entity.velocity.x < 0)
    //     entity.velocity.x += friction;
    // if (entity.velocity.x > 0 && entity.velocity.x < friction)
    //     entity.velocity.x = 0;
    // if (entity.velocity.x >= terminalVelocity)
    //     entity.velocity.x = terminalVelocity;
    // else if(entity.velocity.x <= -terminalVelocity)
    //     entity.velocity.x = -terminalVelocity;

}

function gravity(entity, downForce, terminalVelocity) {
    if(entity.collision.bottom != 0 && entity.velocity.y > 0) {
        if (entity.velocity.y < 1) {
            entity.collision.bounce = 0;
        }
        entity.velocity.y = entity.velocity.y * -1 * entity.collision.bounce;
    }
    else if(entity.collision.bottom == 0) {
        if(entity.velocity.y < terminalVelocity * (1-entity.collision.liquid))
            entity.velocity.y += downForce * (1-entity.collision.liquid);
        else{
            entity.velocity.y -= downForce * (1-entity.collision.liquid);
        }
    }
    // if(entity.collision.inside != 0){
    //     entity.moveDown(-1);
    //     entityList[player.id].collision = e2mCollision(entityList[player.id]);
    //     if (entity.collision.inside == 0) {
    //         entity.moveDown(1);
    //     }
    // }
}

function collisionStop(entity) {
    if (entity.collision.top != 0){
        entity.velocity.y = 0;
        entity.moveDown(1);
    }
    if (entity.collision.left != 0 && entity.velocity.x < 0){
        entity.velocity.x = 0;
        // entity.moveRight(1, true);
    }
    if (entity.collision.right != 0 && entity.velocity.x > 0){
        entity.velocity.x = 0;
        // entity.moveRight(-1, true);
    }
    if (entity.collision.inside != 0)
        entity.moveDown(-1);
}

function debugCollision(entity){
    var geometry = new THREE.BoxGeometry( options.generation.blocksize, options.generation.blocksize, options.generation.blocksize );
    var material = new THREE.MeshBasicMaterial( { color: 0x4f304f} );
    entity.debugCubeTop = new THREE.Mesh( geometry, material );
    scene.add( entity.debugCubeTop );
}

function updateDebugCollsion(entity){
    entity.debugCubeTop.position.set(Math.floor((entity.position.x + options.generation.blocksize / 2) / options.generation.blocksize) * options.generation.blocksize, Math.round((entity.position.y + options.generation.blocksize) / options.generation.blocksize) * options.generation.blocksize, entity.position.z);
}
