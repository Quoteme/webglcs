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

		//TODO: make this work for tiled versions above 1.0.3
		// make the properties section of all json files backwards compatible by converting them to the old json format
		for (var i=0; i<level[levelname].layers.length;i++){
			if(level[levelname].layers[i].properties!=undefined){
				convertPropertiesToOldFormat(level[levelname].layers[i]);
			}
            if(level[levelname].layers[i].objects!=undefined){
                for (var j = 0; j < level[levelname].layers[i].objects.length; j++) {
                    if (level[levelname].layers[i].objects[j].properties!=undefined) {
                        convertPropertiesToOldFormat(level[levelname].layers[i].objects[j]);
                    }
                }
            }
		}
        function convertPropertiesToOldFormat(pNewformat){
            var tempT={};
            var tempP={};
            for (var i = 0; i < pNewformat.properties.length; i++) {
                tempP[pNewformat.properties[i].name]=pNewformat.properties[i].value;
                tempT[pNewformat.properties[i].name]=pNewformat.properties[i].type;
            }
            if (Object.keys(tempP).length>0) {
                pNewformat.properties = tempP;
                pNewformat.propertytypes = tempT;
            }
        }

        level[levelname].loaded = true;
        level[levelname].url = url;
    });
}
