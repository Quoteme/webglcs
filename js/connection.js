allClients = new Array();
socketOwnID = 0;
serversideEntities = Array();

socket.emit("request allClients", 0 );
socket.on('receive clientList', function(cList){
    allClients = cList[0];

    console.log(cList);
    // ----------- ----- ---- document.getElementById("activeUsersList").innerHTML = "";
    for (var i = 0; i < cList[0].length; i++) {
        // ----------- ----- ---- document.getElementById("activeUsersList").innerHTML += "<span style='background-color: #" + intToRGB(hashCode(cList[0][i])) + "'>" + cList[0][i] + "</span><br>";
    }
});
socket.on('receive ownID', function(ownID){
    socketOwnID = ownID;
});

socket.on('new client', function(client){
    // ----------- ----- ---- document.getElementById("chatLog").innerHTML += "<p>player: <span style='background-color: #" + intToRGB(hashCode(client)) + "'>" + client + "</span> connected</p>";
    allClients.push(client);
});

socket.on('terminate', function(client){
    // ----------- ----- ---- document.getElementById("chatLog").innerHTML += "<p>player: <span style='background-color: #" + intToRGB(hashCode(client)) + "'>" + client + "</span> disconnected</p>";
    allClients.splice(allClients.indexOf(client), 1);
    console.log(client + " left game");
    if (typeof minifiedEntityList[client] != "undefined")
        removeMinifiedEntity(client);
});

socket.on('all entity update', function(newEntityList){
    if (multiplayer){
        serversideEntities = newEntityList;
        for (var i = -1; i <= allClients.length; i++) {
            if (allClients[i] != socketOwnID || typeof minifiedEntityList[allClients[i]] !== "object") {
                if(typeof serversideEntities[allClients[i]] !== "undefined"){
                    // console.log(serversideEntities[allClients[i]]);
                    if (typeof minifiedEntityList[allClients[i]] == 'undefined'){
                        preloadMinifiedEntity(serversideEntities[allClients[i]]);
                    }
                    else{
                        if (minifiedEntityList[allClients[i]].img.complete){
                            if (newLevel == false)
                            if (typeof minifiedEntityList[allClients[i]].mesh == 'undefined')
                            displayMinifiedEntity(serversideEntities[allClients[i]]);
                            else
                            updateMinifiedEntity(serversideEntities[allClients[i]]);
                        }

                    }
                }

                // if (typeof(minifiedEntityList[allClients[i]]) == "undefined" && typeof(serversideEntities[allClients[i]]) !== "undefined");
                //     console.log((serversideEntities[allClients[i]]);
            }
        }
    }
});

function disableMultiplayer() {
    window.multiplayer = false;
    console.log(multiplayer);
    for (var i = 0; i < allClients.length; i++) {
        if (typeof serversideEntities[allClients[i]] != undefined)
            removeMinifiedEntity( serversideEntities[allClients[i]] );
    }
    serversideEntities = 0;
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
