// SIMPLE AND EASY FLARE TILEMAP LOADER for JS
// by Luca Leon Happel

// LEVEL ATTRIBUTES

// .header
    // .width = rows
    // .height = collumns
    // .tilewidth
    // .tileheight
// .tilesets
    // array of tilesels used
        // .img.src = url to image
        // .width = of individual tile
        // .height =  of individual tile
        // .marginHow
        // .marginVer
// .layer
    // array of layers used


// HOW TO USE

// simlpy call
    // loadLevel("path/to/level.txt", "nameOfLevel")
    // level["nameOfLevel"].foreground

level = new Object();

function loadLevel(url, levelname){
    level[levelname] = new Object();
    // everytime a new level is being loaded, this flag is set to "false", so the game does not preceed
    // without the game being fully loaded. This flag changes to true, after the server returned the level file
    level[levelname].loaded = false;

    // make a request for the level file
    var client = new XMLHttpRequest();
    client.open('GET', url);

    // this is executed after the level file was loaded
    client.onreadystatechange = function() {
        // the level file is loaded into a temp variable for further modification
        var tempLoadedLevel = client.responseText;

        // define all big parts of the level file
        level[levelname].header = new Object();
            level[levelname].header.width = parseInt( tempLoadedLevel.slice(tempLoadedLevel.indexOf("width=") + 6, tempLoadedLevel.indexOf("height=") ) );
            level[levelname].header.height = parseInt( tempLoadedLevel.slice(tempLoadedLevel.indexOf("height=") + 7, tempLoadedLevel.indexOf("tilewidth=") ) );
            level[levelname].header.tilewidth = parseInt( tempLoadedLevel.slice(tempLoadedLevel.indexOf("tilewidth=") + 10, tempLoadedLevel.indexOf("tileheight=") ) );
            level[levelname].header.tileheight = parseInt( tempLoadedLevel.slice(tempLoadedLevel.indexOf("tileheight=") + 11, tempLoadedLevel.indexOf("orientation=") ) );
            level[levelname].header.orientation = tempLoadedLevel.slice(tempLoadedLevel.indexOf("orientation=") + 12, tempLoadedLevel.indexOf("[tilesets]") - 2);
        level[levelname].tilesets = new Array();
            // read all the tilesets + the very last one and set their size
            for (var i = 0; i < (tempLoadedLevel.match(/tileset=/g) || []).length - 1; i++) {
                level[levelname].tilesets[i] = new Object();
                level[levelname].tilesets[i] = tempLoadedLevel.slice(tempLoadedLevel.split("tileset=", i+1).join("tileset=").length + 8, tempLoadedLevel.split("tileset=", i+2).join("tileset=").length - 1);
            }
            level[levelname].tilesets[level[levelname].tilesets.length] = new Object();
            level[levelname].tilesets[level[levelname].tilesets.length - 1].img = new Image();
            level[levelname].tilesets[level[levelname].tilesets.length - 1].img.src = url.substring(0,url.lastIndexOf("/")+1) + tempLoadedLevel.slice(tempLoadedLevel.split("tileset=", level[levelname].tilesets.length - 1+1).join("tileset=").length + 8, tempLoadedLevel.indexOf("[layer]") - 2);
            level[levelname].tilesets[level[levelname].tilesets.length - 1].width = parseInt( level[levelname].tilesets[level[levelname].tilesets.length - 1].img.src.slice(level[levelname].tilesets[level[levelname].tilesets.length - 1].img.src.split(",", 1).join(",").length + 1, level[levelname].tilesets[level[levelname].tilesets.length - 1].img.src.split(",", 2).join(",").length) );
            level[levelname].tilesets[level[levelname].tilesets.length - 1].height = parseInt( level[levelname].tilesets[level[levelname].tilesets.length - 1].img.src.slice(level[levelname].tilesets[level[levelname].tilesets.length - 1].img.src.split(",", 2).join(",").length + 1, level[levelname].tilesets[level[levelname].tilesets.length - 1].img.src.split(",", 3).join(",").length) );
            level[levelname].tilesets[level[levelname].tilesets.length - 1].marginHor = parseInt( level[levelname].tilesets[level[levelname].tilesets.length - 1].img.src.slice(level[levelname].tilesets[level[levelname].tilesets.length - 1].img.src.split(",", 3).join(",").length + 1, level[levelname].tilesets[level[levelname].tilesets.length - 1].img.src.split(",", 4).join(",").length) );
            level[levelname].tilesets[level[levelname].tilesets.length - 1].marginVer = parseInt( level[levelname].tilesets[level[levelname].tilesets.length - 1].img.src.slice(level[levelname].tilesets[level[levelname].tilesets.length - 1].img.src.split(",", 4).join(",").length + 1, level[levelname].tilesets[level[levelname].tilesets.length - 1].img.src.length) );
            level[levelname].tilesets[level[levelname].tilesets.length - 1].img.src = level[levelname].tilesets[level[levelname].tilesets.length - 1].img.src.slice(0, level[levelname].tilesets[level[levelname].tilesets.length - 1].img.src.indexOf(","));
        level[levelname].layer = new Array();

        // how many different layers does the level have?
        // typically foreground, collision, background
        var layers = (tempLoadedLevel.match(/layer/g) || []).length;

        // load the temp level file into a set of arrays
        tempLoadedLevel = tempLoadedLevel.slice(tempLoadedLevel.indexOf("[layer]"), tempLoadedLevel.length);

        //define individual layers. Get their names and add them to the level object
        for (var i = 0; i <= layers-1; i++) {
            var name = tempLoadedLevel.slice(tempLoadedLevel.split("type=", i+1).join("type=").length + 5, tempLoadedLevel.split("data=", i+1).join("data=").length - 1);
            level[levelname].layer[name] = tempLoadedLevel.slice(tempLoadedLevel.split("data=", i+1).join("data=").length + 6, tempLoadedLevel.split("[layer]", i+2).join("[layer]").length - 2);
            // console.log(tempLoadedLevel.slice(tempLoadedLevel.split("type=", i+1).join("type=").length, tempLoadedLevel.split("type=", i+2).join("type=").length))

            tempLayer = new Array();
            for (var j = 0; j <= (level[levelname].layer[name].match(/,/g) || []).length; j++) {
                tempLayer[j-1] = parseInt(level[levelname].layer[name].slice(level[levelname].layer[name].split(",", j).join(",").length+1, level[levelname].layer[name].split(",", j+1).join(",").length));
            }
            level[levelname].layer[name] = tempLayer;
        }

        // this flag is set to true, so the game can continue
        level[levelname].loaded = true;
    }
    client.send();
}
