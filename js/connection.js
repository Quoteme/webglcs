updateTimer = 25;
sse = new Object(); // serversideEntities
ssBullets = new Object(); // serverside bullets
ownNetworkID = undefined;

setInterval(function () {
    if (typeof(player) == "object" && multiplayer) {
        socket.emit("entity update", {"minifiedEntityData": miniEntityData(entityList[player.id]), "mlb": minifiedLocalBullets(localBullets)} );
    }
}, updateTimer);

// get Own id
socket.emit("give ownID");
socket.on('get ownID', function(id){
    ownNetworkID = id;
});

socket.on('receiveEntity', function(data){
    if (typeof sse[data.id] == "undefined") {
        console.log("joined " + data.id);
        // multiplayer handshake
        // this gets called, whenever a new player joined the game
        sse[data.id] = data.entity;
        sse[data.id].id = data.id;
        preloadMinifiedEntity(sse[data.id]);
    }else {
        // update all the multiplayers
        // first assign the id to the entity itself. otherwise there are some errors :/
        sse[data.id].id = data.id;
        sse[data.id].bullets = data.ssBullets;
        // if the entity is already preloaded, do the updating and stuff
        if (!newLevel && typeof minifiedEntityList[data.id] != "undefined") {
            if (minifiedEntityList[data.id].img.complete && typeof minifiedEntityList[data.id].ctx != "undefined") {
                if (typeof minifiedEntityList[data.id].mesh == 'undefined') {
                    displayMinifiedEntity(sse[data.id]);
                }else {
                    updateMinifiedEntity(sse[data.id]);
                }
            }
        }
        // handle all the bullets
        if (typeof ssBullets[data.id] == "undefined") {
            ssBullets[data.id] = new Array();
        }
        for (i = 0; i < data.ssBullets.length; i++) {
            if (typeof ssBullets[data.id][i] == "undefined") {
                var geometry = new THREE.BoxBufferGeometry( data.ssBullets[i].size.x, data.ssBullets[i].size.y, data.ssBullets[i].size.z );
                var material = new THREE.MeshBasicMaterial( { color: data.ssBullets[i].color } );
                ssBullets[data.id][i] = new THREE.Mesh( geometry, material );
                // adjust position of the projectile
                ssBullets[data.id][i].position.set( data.ssBullets[i].pos.x, data.ssBullets[i].pos.y, data.ssBullets[i].pos.z );
                // change the rotation of the projectile
                ssBullets[data.id][i].rotation.x = data.ssBullets[i].rotation.x,
                ssBullets[data.id][i].rotation.y = data.ssBullets[i].rotation.y,
                ssBullets[data.id][i].rotation.z = data.ssBullets[i].rotation.z;
                scene.add( ssBullets[data.id][i] );
            }else{
                // adjust position of the projectile
                ssBullets[data.id][i].position.set( data.ssBullets[i].pos.x, data.ssBullets[i].pos.y, data.ssBullets[i].pos.z );
                // change the rotation of the projectile
                ssBullets[data.id][i].rotation.x = data.ssBullets[i].rotation.x,
                ssBullets[data.id][i].rotation.y = data.ssBullets[i].rotation.y,
                ssBullets[data.id][i].rotation.z = data.ssBullets[i].rotation.z;
                ssBullets[data.id][i].material.color.setHex( hex23js(data.ssBullets[i].color) );
            }
        }
        // remove all bullets that are not used anymore
        // for this remove all bullets from the end of the ssBullets array from the length of the used data.ssBullets array up until the length of the local ssBullets array
        for (var j = i; j < ssBullets[data.id].length; j++) {
            scene.remove(ssBullets[data.id][j]);
            ssBullets[data.id].splice(j, 1);
        }
    }
    sse[data.id] = data.entity;
    sse[data.id].id = data.id;
    sse[data.id].bullets = data.ssBullets;
});

socket.on('damageReceived', function(data){
    if (data.victim == ownNetworkID) {
        entityList[player.id].health -= data.damage;
    }
});

socket.on('disconnected', function(id){
    console.log("disconnected " + id);
    removeMinifiedEntity(id);
    delete sse[id];
});

// socket.on('all entity update', function(newEntityList){
//     if (multiplayer){
//         sse = newEntityList;
//         for (var i = -1; i <= allClients.length; i++) {
//             if (allClients[i] != socketOwnID || typeof minifiedEntityList[allClients[i]] !== "object") {
//                 if(typeof sse[allClients[i]] !== "undefined"){
//                     // console.log(sse[allClients[i]]);
//                     if (typeof minifiedEntityList[allClients[i]] == 'undefined'){
//                         preloadMinifiedEntity(sse[allClients[i]]);
//                     }
//                     else{
//                         if (minifiedEntityList[allClients[i]].img.complete){
//                             if (newLevel == false)
//                             if (typeof minifiedEntityList[allClients[i]].mesh == 'undefined')
//                             displayMinifiedEntity(sse[allClients[i]]);
//                             else
//                             updateMinifiedEntity(sse[allClients[i]]);
//                         }
//
//                     }
//                 }
//
//                 // if (typeof(minifiedEntityList[allClients[i]]) == "undefined" && typeof(sse[allClients[i]]) !== "undefined");
//                 //     console.log((sse[allClients[i]]);
//             }
//         }
//     }
// });

function disableMultiplayer() {
    window.multiplayer = false;
    console.log(multiplayer);
    for (var i = 0; i < allClients.length; i++) {
        if (typeof sse[allClients[i]] != undefined)
            removeMinifiedEntity( sse[allClients[i]] );
    }
    sse = 0;
}

function enableMultiplayer() {
    window.multiplayer = true;
}

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}
