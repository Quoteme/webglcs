// entity to entity collision detection
function e2eCollision(entityOne, entityTwo){

}

// entity to map collsion detection
function e2mCollision(entity_position) {
    collision = new Object();
    collision.top = false;
    collision.bottom = false;
    collision.left = false;
    collision.right = false;
    collision.inside = false;
    // cycle thtrough all layers
    for (var k = 0; k < level[currentLevel].layers.length; k++) {
        // find if one layer has "collision" set to "true"
        if(typeof(level[currentLevel].layers[k].properties) !== "undefined")
            if(typeof(level[currentLevel].layers[k].properties.collision) !== "undefined")
                if(level[currentLevel].layers[k].properties.collision == "true"){
                    collision.inside = level[currentLevel].layers[k].data[Math.round(entity_position.x / blockSize) + -1 *Math.round((entity_position.y - 6) / blockSize)*level[currentLevel].width];
                    collision.left = level[currentLevel].layers[k].data[Math.floor((entity_position.x + blockSize) / blockSize)-1 + -1 * Math.round(entity_position.y / blockSize)*level[currentLevel].width];
                    collision.right = level[currentLevel].layers[k].data[Math.round((entity_position.x - blockSize / 2) / blockSize)+1 + -1 * Math.round(entity_position.y / blockSize)*level[currentLevel].width];
                    collision.top = level[currentLevel].layers[k].data[Math.floor((entity_position.x + blockSize / 2) / blockSize) + -1 * (Math.floor(entity_position.y / blockSize) + 1)*level[currentLevel].width];
                    collision.bottom = level[currentLevel].layers[k].data[(Math.floor((entity_position.x - blockSize / 2) / blockSize)+1) + -1 * ((Math.floor(entity_position.y / blockSize)+1) - 1)*level[currentLevel].width];
                    if (typeof liquidLayers != "undefined"){
                        if (liquidLayers.length == 0)
                            collision.liquid = 0;
                        else
                        for (var p = 0; p < liquidLayers.length; p++) {
                            if (level[currentLevel].layers[liquidLayers[p]].data[Math.round(entity_position.x / blockSize) + -1 *Math.round((entity_position.y - 6) / blockSize)*level[currentLevel].width] != 0)
                                collision.liquid = parseFloat(level[currentLevel].layers[liquidLayers[p]].properties.liquid);
                            else
                                collision.liquid = 0;
                        }
                    }else {
                        collision.liquid = 0;
                    }
                    // if(collision.leftType != 0 &&
                    //     entity.position.x >= (Math.round(entity.position.x / blockSize)-1)*blockSize &&
                    //     entity.position.x <= (Math.round(entity.position.x / blockSize))*blockSize)
                    //     collision.left = true;
                    // if(collision.rightType != 0 &&
                    //     entity.position.x >= (Math.round(entity.position.x / blockSize))*blockSize &&
                    //     entity.position.x <= (Math.round(entity.position.x / blockSize)+1)*blockSize)
                    //     collision.right = true;
                    // if(collision.topType != 0 &&
                    //     entity.position.y >= (Math.round(entity.position.y / blockSize)-1)*blockSize &&
                    //     entity.position.y <= (Math.round(entity.position.y / blockSize))*blockSize)
                    //     collision.top = true;
                    // if(collision.bottomType != 0 &&
                    //     entity.position.y >= (Math.round(entity.position.y / blockSize))*blockSize&&
                    //     entity.position.y <= (Math.round(entity.position.y / blockSize)+1)*blockSize)
                    //     collision.bottom = true;
                }

    }
    return collision;
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
    if(entity.collision.bottom != 0)
        entity.velocity.y = 0;
    else {
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
    if (entity.collision.left != 0){
        entity.velocity.x = 0;
        // entity.moveRight(1, true);
    }
    if (entity.collision.right != 0){
        entity.velocity.x = 0;
        // entity.moveRight(-1, true);
    }
    if (entity.collision.inside != 0)
        entity.moveDown(-1);
}

function debugCollision(entity){
    var geometry = new THREE.BoxGeometry( blockSize, blockSize, blockSize );
    var material = new THREE.MeshBasicMaterial( { color: 0x4f304f} );
    entity.debugCubeTop = new THREE.Mesh( geometry, material );
    scene.add( entity.debugCubeTop );
}

function updateDebugCollsion(entity){
    entity.debugCubeTop.position.set(Math.floor((entity.position.x + blockSize / 2) / blockSize) * blockSize, Math.round((entity.position.y + blockSize) / blockSize) * blockSize, entity.position.z);
}
