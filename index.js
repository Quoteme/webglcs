var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var port = process.env.PORT || 3000;

// send html files to client
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
app.use(express.static(__dirname));

// handle the connection of a user
io.on('connection', function(socket){
    console.log('a user connected : ' + socket.id);

    socket.on('disconnect', function(){
        console.log('user disconnected : ' + socket.id);
        socket.broadcast.emit("disconnected", socket.id);
    });

    socket.on('entity update', function(data){
        socket.broadcast.emit("receiveEntity", {"entity": data.minifiedEntityData, "ssBullets": data.mlb, "id": socket.id});
    });

    // miscelleaus other functions
    socket.on('chat message', function(msg){
        io.emit('chat message', [socket.id, msg]);
    });

    socket.on('give ownID', function(data){
        io.sockets.connected[socket.id].emit('get ownID', socket.id);
    });

    socket.on('weaponDamage', function(data){
        io.emit('damageReceived', data);
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
    socket.on('request weaponThumbs', function(folder){
        io.sockets.connected[socket.id].emit('receive weaponThumbs', getFiles(folder));
    });
});

http.listen(port, function(){
    console.log('listening on *:' + port);
});

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
