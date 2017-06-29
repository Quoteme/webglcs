allCurrentEntities = new Array();
// governs how long an ID for local entities can be. 10^8 should be more than enough
entityIdSpace = Math.pow(10, 8);

// just generates a new ID.
// TODO: check if the ID is already taken
function EntityID(id) {
    this.id = id || Math.round(Math.random()*entityIdSpace);
}
function Entity(id, x, y, z, width, height, imgURL, health){
    if (imgURL == "player_image")
        imgURL = document.getElementById("playerImageLocation").value;

    this.id = id || new EntityID();
    // add this new entity to the allCurrentEntities array, that stores all "local" / not serverside entities
    allCurrentEntities.push(this.id);
    // load the texture used by the entity
    // this image will then be drawn on a canvas, which will then be drawn onto a plain in Three.js
    // effectively allowing non-power of 2 images to be used
    this.img = new Image();
    this.img.src = imgURL;
    this.visible = true;
    this.opacity = 1;
    this.direction = true; // true = left | false = right
    this.maxHealth = health || 3;
    this.health = this.maxHealth;
    this.name = document.getElementById("nickname").value;
    this.weapon = "";

    this.mesh = null; // will get a value durning displayEntity(...);

    this.speed = 1.75; // slow 1.5 | fast 2
    this.speedOnFoot = 0.3;
    this.speedInAir = 0.125;
    this.airSpeed = 0.5;
    this.fallSpeed = 0.105; // slow  0.095 | fast 0.115
    this.airDrag = 0.98;
    this.size = {x:width, y:height };
    this.position = {x:x, y:y, z:z};
    this.velocity = {x:0, y:0, z:0};
    // this.momentum = {x:0, y:0, z:0};
    this.ammunition = 0;
    this.rounds = 0;
    this.reloadTimer = 0;

    var parent = this;

    this.loadWeapon = function (url) {
        function loaderFunction(callback) {
            var xobj = new XMLHttpRequest();
                xobj.overrideMimeType("application/json");
            xobj.open('GET', url, true); // Replace 'my_data' with the path to your file
            xobj.onreadystatechange = function () {
                  if (xobj.readyState == 4 && xobj.status == "200") {
                    // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                    callback(xobj.responseText);
                  }
            };
            xobj.send(null);
        }
        loaderFunction(function(response) {
            // Parse JSON string into object
            var actual_JSON = JSON.parse(response);
            // now join this together with the parent
            parent.weapon = actual_JSON;
        });
    }
    this.removeWeapon = function () {
        parent.weapon = "";
    }
    this.shootWeapon = function () {
        if (parent.reloadTimer <= 0 && typeof parent.weapon == "object") {
            parent.reloadTimer = parent.weapon.knockbackTime;
            for (var i = 0; i < parent.weapon.trajectory.length; i++) {
                spawnBullet(parent.id, {"origin": _.cloneDeep(parent.position),
                    "speed": parent.weapon.speed, "up": 0, "right": 1,
                    "decay": parent.weapon.decay, "weight": parent.weapon.weight,
                    "animation": parent.weapon.animation, "trajectory": parent.weapon.trajectory[i],
                    "bullet" : parent.weapon.bullet, "knockback" : parent.weapon.knockback,
                    "collision" : _.cloneDeep(parent.weapon.collision), "damage" : parent.weapon.damage});
            }
        }
    }

    // These functions are mostly for controling the entity yourself using the controles.js
    // as these are not neccesary for serverside entities
    this.moveRight = function(p, noTurn){
        parent.position.x += p;
        parent.mesh.position.x += p;
        if (!noTurn){
            if(p<0)
                parent.direction = true;
            else if (p>0)
                parent.direction = false;
        }
    }
    this.moveDown = function(p){
        for (var i = 0; i < p; i++) {
            if (e2mCollision({x:parent.position.x, y:parent.position.y - i, z:parent.position.z }).bottom != 0){
                p = i;
                break;
            }
        }
        parent.position.y -= p;
        parent.mesh.position.y -= p;
    }
    // use gravity for this entity?
    this.gravity = true;

    // this variable allows the loadJSON function to use the this object from here
    parent = this;

    // loads the corrseponding imgURL.json file, that gives crucial info about the image that is being used
    // like its size, animations and stuff
    function loadJSON(callback) {
        var xobj = new XMLHttpRequest();
            xobj.overrideMimeType("application/json");
        xobj.open('GET', imgURL.replace(/.png|.jpg|.jpeg|.gif/, ".json"), true); // Replace 'my_data' with the path to your file
        xobj.onreadystatechange = function () {
              if (xobj.readyState == 4 && xobj.status == "200") {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                callback(xobj.responseText);
              }
        };
        xobj.send(null);
    }
    loadJSON(function(response) {
        // Parse JSON string into object
        var actual_JSON = JSON.parse(response);
        // now join this together with the parent
        parent = Object.assign(parent, actual_JSON);
        parent.canvas.width = parent.imageSize.x;
        parent.canvas.height = parent.imageSize.y;

    });

    // TODO: fetch the following information from the img-url.json
    // Frame of the animation that is currently used / is an animation has multiple
    // frames, this shows which one of them is currently used
    this.frame = 0;
    // just a temp variable to count each time the animation funciton is called
    // after this var > animationDuration this.frame gets incremented
    this.animationTimer = 0;
    this.imageSize = {x:32, y:32};
    // the default animation used
    this.usedAnimation = "stand";
    // How long a specific frame is shown
    this.animationDuration = 15;

    this.animation = {
        stand: [0],
        run: [0,1,2],
        up: [3],
        upRun: [3,4,5],
        ascend: [1],
        fall: [2],
        fallLookUp: [4],
        fallLookDown: [6],
        look: [7],
        hover: [8],
        dead: [9],
        deadFall: [10]
    }

    // Add a canvas to which the sprite gets drawn
    // this canvas will then get drawn to a plain that represents the entity in three.js
    // the canvas is also shrinked to the sprite size
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = this.imageSize.x;
    this.canvas.height = this.imageSize.y;
    this.ctx.drawImage(this.img, 0, 0);
}

function displayEntity(entityName, autofocus) {
    // Get the texture for the entity from the canvas that was created for this entity
    entityName.texture = new THREE.CanvasTexture(entityList[entityName.id].canvas);
    // This allows easier animation, as well as the use of Three.NearestFilter / pixelated look without blur
    entityName.texture.magFilter = THREE.NearestFilter;
    entityName.texture.minFilter = THREE.NearestFilter;
    entityName.texture.wrapT = THREE.RepeatWrapping;
    entityName.texture.wrapS = THREE.RepeatWrapping;
    // do something with the entityName.texture
    var geometry = new THREE.PlaneGeometry( entityName.size.x, entityName.size.y );

    var material = new THREE.MeshLambertMaterial( {
        color: 0xffffff,
        map: entityName.texture,
        transparent: true
    } );
    material.side = THREE.DoubleSide;
    // material.needsUpdate = true;

    entityName.mesh = new THREE.Mesh( geometry, material );
    entityName.mesh.position.set (entityName.position.x, entityName.position.y + 1, entityName.position.z + blockSize * 0.25);
    // due to some problems with collision, all sprites must be rendered one pixel above
    if (entityShadows) {
        entityName.mesh.castShadow = true;
        entityName.mesh.receiveShadow = true;
    }

    scene.add( entityName.mesh );
    // entityName.mesh.castShadow = true;
    // entityName.mesh.receiveShadow = true;
    if (autofocus)
        focusEntity(entityName, camera);
}

function focusEntity(entity, cameraName, depth, speed, lookAt) {
    // focuses an entity by setting the camera X & Y to the same
    // if depth is TRUE, then the camera will also focus on Z axis
    // TODO: add camera drag / gradually move to the entity
    if (typeof speed == "undefined") {
        speed = {"x":10000, "y":10000};
    }

    // stabilize the camera, so that it wont move back and forth every frame
    if (Math.abs(cameraName.position.x - entity.position.x) < speed.x) {
        speed.x = Math.abs(cameraName.position.x - entity.position.x);
    }
    if (Math.abs(cameraName.position.y - entity.position.y) < speed.y) {
        speed.y = Math.abs(cameraName.position.y - entity.position.y);
    }
    // finally set the real position
    cameraName.position.x += -1 * Math.sign(cameraName.position.x - entity.position.x) * speed.x;
    cameraName.position.y += -1 * Math.sign(cameraName.position.y - entity.position.y) * speed.y;
    if (depth) {
        cameraName.position.z = cameraDistance * 32 + 100;
    }
    if (lookAt) {
        cameraName.lookAt(entity.position);
    }

    // cameraName.position.set(entity.position.x, entity.position.y + 20, depth ? cameraDistance * 32 + 100 : cameraName.position.z);
}

function moveEntity(entityID) {
    // calcutates the entity velocity to an actual X & Y position
    entityList[entityID].moveDown(entityList[entityID].velocity.y * entityList[entityID].speed);
    entityList[entityID].moveRight(entityList[entityID].velocity.x * entityList[entityID].speed);
}

function animateEntities() {
    // goes through all local entities and checks if one of them needs to change its animation / direction
    for (var i = 0; i < allCurrentEntities.length; i++) {

        // change model to the direction the player is facing
        if(entityList[allCurrentEntities[i]].direction)
            entityList[allCurrentEntities[i]].mesh.rotation.y = 0;
        else
            entityList[allCurrentEntities[i]].mesh.rotation.y = Math.PI / 1;

        // actually animate the entities
        if(entityList[allCurrentEntities[i]].animationTimer <= entityList[allCurrentEntities[i]].animationDuration){
            // TODO: Look what exactly I did here and comment that
            entityList[allCurrentEntities[i]].ctx.clearRect(0,0,entityList[allCurrentEntities[i]].canvas.width,entityList[allCurrentEntities[i]].canvas.height);
            for (var t = 0; t < entityList[allCurrentEntities[i]].animation[entityList[allCurrentEntities[i]].usedAnimation].length; t++) {
                if(entityList[allCurrentEntities[i]].animationTimer > t * (entityList[allCurrentEntities[i]].animationDuration / entityList[allCurrentEntities[i]].animation[entityList[allCurrentEntities[i]].usedAnimation].length) &&
                    entityList[allCurrentEntities[i]].animationTimer < (t+1) * (entityList[allCurrentEntities[i]].animationDuration / entityList[allCurrentEntities[i]].animation[entityList[allCurrentEntities[i]].usedAnimation].length)){
                        // console.log("t: " + t + " timer: " + entityList[allCurrentEntities[i]].animationTimer + " Duration: " + entityList[allCurrentEntities[i]].animationDuration + " used Animation: " + entityList[allCurrentEntities[i]].animation[entityList[allCurrentEntities[i]].usedAnimation].length);
                        entityList[allCurrentEntities[i]].frame = entityList[allCurrentEntities[i]].animation[entityList[allCurrentEntities[i]].usedAnimation][t];
                    }
            }
            entityList[allCurrentEntities[i]].ctx.drawImage(entityList[allCurrentEntities[i]].img, entityList[allCurrentEntities[i]].frame * -1 * entityList[allCurrentEntities[i]].imageSize.x, 0);
            entityList[allCurrentEntities[i]].texture.needsUpdate = true;
            entityList[allCurrentEntities[i]].mesh.material.needsUpdate = true;
            entityList[allCurrentEntities[i]].animationTimer++;
        }else{
            entityList[allCurrentEntities[i]].animationTimer = 0;
        }
    }
}

function miniEntityData(base, newID) {
    // this creates entities that only consist of the most funamental information for sending
    // them to the server and saving bandwidth
    entity = new Object();
    entity.id = newID;

    entity.src = base.img.src;
    entity.size = base.size;
    entity.visible = base.visible;
    entity.opacity = base.opacity;
    entity.direction = base.direction;
    entity.position = base.position;
    entity.animation = base.animation[base.usedAnimation][base.frame] || base.animation[base.usedAnimation][0];
    entity.crntLvl = level[currentLevel].url; // current level url
    entity.imgWidth = base.imageSize.x;
    entity.imgHeight = base.imageSize.y;
    entity.nickname = base.name;
    entity.maxHealth = base.maxHealth;
    entity.health = base.health;
    return entity;
}

minifiedEntityList = new Object();

function preloadMinifiedEntity(entity) {
    minifiedEntityList[entity.id] = new Object();
    minifiedEntityList[entity.id].img = new Image();
    minifiedEntityList[entity.id].img.src = entity.src;
    minifiedEntityList[entity.id].canvas = document.createElement('canvas');
    minifiedEntityList[entity.id].ctx = minifiedEntityList[entity.id].canvas.getContext("2d");
    console.log(entity.imgWidth);
    minifiedEntityList[entity.id].canvas.width = entity.imgWidth;
    minifiedEntityList[entity.id].canvas.height = entity.imgHeight;
}

function displayMinifiedEntity(entity) {
    minifiedEntityList[entity.id].ctx.drawImage(minifiedEntityList[entity.id].img, 0, 0);
    minifiedEntityList[entity.id].texture = new THREE.CanvasTexture(minifiedEntityList[entity.id].canvas);
    minifiedEntityList[entity.id].texture.magFilter = THREE.NearestFilter;
    minifiedEntityList[entity.id].texture.minFilter = THREE.NearestFilter;
    minifiedEntityList[entity.id].texture.wrapT = THREE.RepeatWrapping;
    minifiedEntityList[entity.id].texture.wrapS = THREE.RepeatWrapping;
    minifiedEntityList[entity.id].geometry = new THREE.PlaneGeometry( entity.size.x, entity.size.y );
    minifiedEntityList[entity.id].material = new THREE.MeshLambertMaterial( {
        color: "#" + intToRGB(hashCode(entity.id)) || 0xbbff88,
        map: minifiedEntityList[entity.id].texture,
        transparent: true
    } );
    minifiedEntityList[entity.id].material.side = THREE.DoubleSide;
    // material.needsUpdate = true;

    minifiedEntityList[entity.id].mesh = new THREE.Mesh( minifiedEntityList[entity.id].geometry, minifiedEntityList[entity.id].material );
    minifiedEntityList[entity.id].mesh.position.set (entity.position.x, entity.position.y, entity.position.z);
    // due to some problems with collision, all sprites must be rendered one pixel above

    if (entityShadows) {
        minifiedEntityList[entity.id].mesh.castShadow = true;
        minifiedEntityList[entity.id].mesh.receiveShadow = true;
    }

    scene.add( minifiedEntityList[entity.id].mesh );
}

function updateMinifiedEntity(entity) {
    minifiedEntityList[entity.id].canvas.width = entity.imgWidth;
    minifiedEntityList[entity.id].canvas.height = entity.imgHeight;
    minifiedEntityList[entity.id].crntLvl = entity.crntLvl;
    minifiedEntityList[entity.id].direction = entity.direction;
    minifiedEntityList[entity.id].animation = entity.animation;
    // console.log(entity.position);
    // console.log(minifiedEntityList[entity.id].mesh.position);
    if (minifiedEntityList[entity.id].crntLvl == level[currentLevel].url)
        minifiedEntityList[entity.id].mesh.visible = true;
    else
        minifiedEntityList[entity.id].mesh.visible = false;

    minifiedEntityList[entity.id].mesh.position.set( entity.position.x, entity.position.y + 0.5, entity.position.z + 0.5 );

    if(minifiedEntityList[entity.id].direction)
        minifiedEntityList[entity.id].mesh.rotation.y = 0;
    else
        minifiedEntityList[entity.id].mesh.rotation.y = Math.PI / 1;

    minifiedEntityList[entity.id].ctx.clearRect(0,0,minifiedEntityList[entity.id].canvas.width,minifiedEntityList[entity.id].canvas.height);
    minifiedEntityList[entity.id].ctx.drawImage(minifiedEntityList[entity.id].img, minifiedEntityList[entity.id].animation * -entity.imgWidth, 0);
    minifiedEntityList[entity.id].mesh.material.map.needsUpdate = true;
}

function removeMinifiedEntity(entityid) {
    scene.remove(minifiedEntityList[entityid].mesh);
    delete minifiedEntityList[entityid];
}
