var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var port = process.env.PORT || 3000;

updateTimer = 25;

allClients = new Array();
entityData = new Object();

// error handler
process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

// send index.html if client accesses home directory
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
// on any static (normal) request for a file from the client, allow him to access any file on the server
app.use(express.static(__dirname));

// on new connection
io.on('connection', function(socket){
    console.log('user ' +   socket.id + ' connected' );
    allClients.push(socket.id);
    io.emit("new client", socket.id);


    // Was passiert, wenn der Spieler das Spiel beendet
    // What happens if the player ends the game
    socket.on('disconnect', function(){
        console.log('user ' + socket.id + ' disconnected');
        var i = allClients.indexOf(socket);
        allClients.splice(i, 1);
        delete entityData[socket.id];
        io.emit('terminate', socket.id);
        for (var i = 0; i < entityData.length; i++) {
            if ( typeof entityData[i] == "undefined"){
                delete entityData[i];
            }
        }
        // console.log(allClients);
    });

    socket.on('chat message', function(msg){
        io.emit('chat message', [socket.id, msg]);
    });

    socket.on('request refreshLvlSel', function(folder){
        io.sockets.connected[socket.id].emit('receive refreshLvlSel', getFiles(folder));
    });
    socket.on('request showChars', function(folder){
        io.sockets.connected[socket.id].emit('receive showChars', getFiles(folder));
    });
    socket.on('request allClients', function(temp){
        io.sockets.connected[socket.id].emit('receive clientList', [allClients, entityData]);
        io.sockets.connected[socket.id].emit('receive ownID', socket.id);
    });
    socket.on('entity update', function(minifiedEntityData){
        entityData[minifiedEntityData.id] = minifiedEntityData;
    });
    socket.on('request weaponThumbs', function(folder){
        io.sockets.connected[socket.id].emit('receive weaponThumbs', getFiles(folder));
    });
});

http.listen(port, function(){
    console.log('listening on *:' + port);
});

setInterval(function () {
    io.emit("all entity update", entityData);
}, updateTimer);

// Allgemeine Funktionen
// Common functions
function getFiles (dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }

    return files_;
}

function addFile(file){
    app.get(file, function(req, res){
        res.sendFile(__dirname + file);
    });
}
