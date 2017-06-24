function pauseMenu() {
    console.log(document.getElementsByClassName("menu")[0].style.marginLeft);
    if (document.getElementsByClassName("menu")[0].style.marginLeft == "-300%"){
        document.getElementsByClassName("menu")[0].style.marginLeft = "0px";
        menuShown = true;
        if (typeof newLevel == "undefined" || newLevel) {
            document.styleSheets[0].cssRules[document.styleSheets[0].cssRules.length - 1].style.filter = "blur(10px)"
        }else {
            document.styleSheets[0].cssRules[document.styleSheets[0].cssRules.length - 1].style.filter = "blur(10px)grayscale()"
        }
    }
    else{
        document.getElementsByClassName("menu")[0].style.marginLeft = "-300%";
        menuShown = false;
        document.styleSheets[0].cssRules[document.styleSheets[0].cssRules.length - 1].style.filter = "";
    }
}

function showMenuPart(layer,id) {
    for (var j = 4; j >= layer; j--) {
        for (var i = 0; i < document.getElementsByClassName("layer" + j).length; i++) {
            document.getElementsByClassName("layer" + j)[i].style.display = "none";
        }
    }
    document.getElementById(id).style.display = "block";
}

function refreshLvlSel(folder) {
    console.log(folder);
    socket.emit("request refreshLvlSel", folder );
    socket.on('receive refreshLvlSel', function(folderContent){
        console.log(folderContent);
        document.getElementById("levelList").innerHTML = "";
        for (var i = 0; i < folderContent.length; i++) {
            if (!~folderContent[i].indexOf(".tmx"))
                document.getElementById("levelList").innerHTML += "<div class='category' onclick='document.getElementById(&quot;levelName&quot;).value = &quot;" + folderContent[i] + "&quot;'>" +  folderContent[i] + "</div>";
        }
    });
}

function weaponThumbsReload(folder) {
    var counter = 0;
    socket.emit("request weaponThumbs", folder );
    socket.on('receive weaponThumbs', function(folderContent){
        document.getElementById("weaponList").innerHTML = "";
        counter++;
        if (counter<= 1) {
            for (var i = 0; i < folderContent.length; i++) {
                if (~folderContent[i].indexOf(".json")){
                    loadWeaponJSON(folderContent[i], i);
                    function loadWeaponJSON(itemURL, counter) {
                        var xobj = new XMLHttpRequest();
                            xobj.overrideMimeType("application/json");
                        xobj.open('GET', itemURL, true); // Replace 'my_data' with the path to your file
                        xobj.onreadystatechange = function () {
                            if (xobj.readyState == 4 && xobj.status == "200") {
                                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                                obj = JSON.parse(xobj.responseText);
                                loadedWeaponJSON(obj, counter);
                              }
                        };
                        xobj.send(null);
                    }
                    function loadedWeaponJSON(json, counter) {
                        document.getElementById("weaponList").innerHTML += "<div class='category' onclick='document.getElementById(&quot;chosenWeapon&quot;).value = &quot;" + folderContent[counter] + "&quot;; entityList[player.id].loadWeapon(&quot;" + folderContent[counter] + "&quot;)'><img src=" + json.thumbnail + " class='weaponPreview'/> " + json.name + "</div>";
                    }
                }
            }
        }
    });
}

function showChars(folder) {
    socket.emit("request showChars", folder );
    socket.on('receive showChars', function(folderContent){
        document.getElementById("charList").innerHTML = "";
        for (var i = 0; i < folderContent.length; i++) {
            if (!~folderContent[i].indexOf(".json"))
                document.getElementById("charList").innerHTML += "<div class='category' onclick='document.getElementById(&quot;playerImageLocation&quot;).value = &quot;" + folderContent[i] + "&quot;'><img src='" + folderContent[i] + "'/></div>";
        }
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
