level = new Object();

function loadLevel(url, levelname) {
    loadingCube.visible = false;
    loadingCounter = 0;
    level[levelname] = new Object();
    level[levelname].loaded = false;
    function loadJSON(callback) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', url, true);
        // Replace 'my_data' with the path to your file
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                // Required use of an anonymous callback
                // as .open() will NOT return a value but simply returns undefined in asynchronous mode
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
    }
    loadJSON(function(response) {
        // Parse JSON string into object
        level[levelname] = JSON.parse(response);
        for (var i = 0; i < level[levelname].tilesets.length; i++) {
            level[levelname].tilesets[i].src = level[levelname].tilesets[i].image;
            level[levelname].tilesets[i].img = new Image();
            level[levelname].tilesets[i].img.src = url.substring(0,url.lastIndexOf("/")) + "/" + level[levelname].tilesets[i].src;

            level[levelname].tilesets[i].bumpMap = new Image();
            level[levelname].tilesets[i].bumpMap.src = url.substring(0,url.lastIndexOf("/")) + "/" + level[levelname].tilesets[i].src.substring(0,url.lastIndexOf(".")) + "-bump." + level[levelname].tilesets[i].src.substring(url.lastIndexOf(".") + 1, level[levelname].tilesets[i].src.length);

            level[levelname].tilesets[i].src = undefined;

        }

        level[levelname].loaded = true;
        level[levelname].url = url;
    });
}
