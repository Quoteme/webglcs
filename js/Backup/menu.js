function pauseMenu() {
    if (document.getElementsByClassName("menu")[0].style.display == "none")
        document.getElementsByClassName("menu")[0].style.display = "block";
    else
        document.getElementsByClassName("menu")[0].style.display = "none";
}

function showMenuPart(id) {
    // for (var i = 0; i < document.getElementsByClassName("menuBody").length; i++) {
    //     document.getElementsByClassName("menuBody")[i].style.display = "none";
    // }
    // for (var i = 0; i < document.getElementsByClassName("menuItem").length; i++) {
    //     document.getElementsByClassName("menuItem")[i].setAttribute("id", "notSelected");
    //     if (document.getElementsByClassName("menuItem")[i].innerHTML == id)
    //         document.getElementsByClassName("menuItem")[i].setAttribute("id", "selected");
    // }
    // document.getElementById(id).style.display = "block";
}

function refreshLvlSel(folder) {
    socket.emit("request refreshLvlSel", folder );
    socket.on('receive refreshLvlSel', function(folderContent){
        document.getElementById("levelSelect").innerHTML = "";
        document.getElementById("levelSelect").innerHTML += "<ul>";
        for (var i = 0; i < folderContent.length; i++) {
            if (!~folderContent[i].indexOf(".tmx"))
                document.getElementById("levelSelect").innerHTML += "<li><button type='button' onclick='document.getElementById(&quot;levelName&quot;).value = &quot;" + folderContent[i] + "&quot;'> " + folderContent[i] + "</button></li>";
        }
        document.getElementById("levelSelect").innerHTML += "</ul>"
    });
}

function weaponThumbsReload(folder) {
    socket.emit("request weaponThumbs", folder );
    socket.on('receive weaponThumbs', function(folderContent){
        imgs = new Array();
        for (var i = 0; i < folderContent.length; i++) {
            if (~folderContent[i].indexOf(".json")){

                function loadJSON(callback) {
                    var xobj = new XMLHttpRequest();
                        xobj.overrideMimeType("application/json");
                    xobj.open('GET', folderContent[i], true); // Replace 'my_data' with the path to your file
                    xobj.onreadystatechange = function () {
                          if (xobj.readyState == 4 && xobj.status == "200") {
                            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                            obj = JSON.parse(xobj.responseText);
                            callback(obj.thumbnail);
                          }
                    };
                    xobj.send(null);
                }
                function loadedJSON(url) {
                    imgs.push(url);
                }
            }
        }
    });
}

function showChars(folder) {
    socket.emit("request showChars", folder );
    socket.on('receive showChars', function(folderContent){
        document.getElementById("skinPreview").innerHTML = "";
        document.getElementById("skinPreview").innerHTML += "<ul>";
        for (var i = 0; i < folderContent.length; i++) {
            if (!~folderContent[i].indexOf(".json"))
                document.getElementById("skinPreview").innerHTML += "<li><div onclick='document.getElementById(&quot;playerImageLocation&quot;).value = &quot;" + folderContent[i] + "&quot;'><img src='" + folderContent[i] + "'/></div></li>";
        }
        document.getElementById("skinPreview").innerHTML += "</ul>"
    });
}

socket.on('chat message', function(msg){
    document.getElementById("chatLog").innerHTML += "<span style='color: " + intToRGB(hashCode(msg[0])) + "'>" + msg[0] + "</span>" + ": " + msg[1] + "<br>";
});

function sendMSG(msg) {
    socket.emit('chat message', stripHTML( msg ) );
    document.getElementById("chatInput").value = "";
}

function shadowsOnOff() {
    if (renderer.shadowMap.enabled){
        renderer.shadowMap.enabled = false;
        document.getElementById("shadowsOnOffBtn").innerHTML = "OFF";
    }else {
        renderer.shadowMap.enabled = true;
        document.getElementById("shadowsOnOffBtn").innerHTML = "ON";
    }
}

function entityShadowsOnOff() {
    if (entityShadows) {
        entityShadows = false;
        document.getElementById("entityShadowsOnOffBtn").innerHTML = "OFF";
    }else {
        entityShadows = true;
        document.getElementById("entityShadowsOnOffBtn").innerHTML = "ON";
    }
}

function changeShadowQuality(val) {
    shadowQuality = Math.pow(2, val);
}

// used to assign a color to each user id
function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

function stripHTML(text){
   var regex = /(<([^>]+)>)/ig;
   text = text.replace(regex, "");
   return text;
}
