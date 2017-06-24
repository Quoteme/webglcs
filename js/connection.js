updateTimer = 25;
sse = new Object(); // serversideEntities

setInterval(function () {
    if (typeof(player) == "object" && multiplayer) {
        socket.emit("entity update", miniEntityData(entityList[player.id]) );
    }
}, updateTimer);

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
    }
    sse[data.id] = data.entity;
});

socket.on('disconnected', function(id){
    console.log("disconnected " + id);
    removeMinifiedEntity(id);
    delete sse[id];
});

socket.on('all entity update', function(newEntityList){
    if (multiplayer){
        sse = newEntityList;
        for (var i = -1; i <= allClients.length; i++) {
            if (allClients[i] != socketOwnID || typeof minifiedEntityList[allClients[i]] !== "object") {
                if(typeof sse[allClients[i]] !== "undefined"){
                    // console.log(sse[allClients[i]]);
                    if (typeof minifiedEntityList[allClients[i]] == 'undefined'){
                        preloadMinifiedEntity(sse[allClients[i]]);
                    }
                    else{
                        if (minifiedEntityList[allClients[i]].img.complete){
                            if (newLevel == false)
                            if (typeof minifiedEntityList[allClients[i]].mesh == 'undefined')
                            displayMinifiedEntity(sse[allClients[i]]);
                            else
                            updateMinifiedEntity(sse[allClients[i]]);
                        }

                    }
                }

                // if (typeof(minifiedEntityList[allClients[i]]) == "undefined" && typeof(sse[allClients[i]]) !== "undefined");
                //     console.log((sse[allClients[i]]);
            }
        }
    }
});

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
