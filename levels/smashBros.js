level[currentLevel].gameCode = {
    "loop" : 0,
    init : function () {
        entityList[player.id].loadWeapon("usr/weapons/PolarStar.json");
        entityList[player.id].maxHealth = 100;
        entityList[player.id].health = 100;
        entityList[player.id].friendlyFire = true;
    },
    update : function(){
        if (this.loop == 0) {
            this.init();
        }
        entityList[player.id].knockbackResistance = 100 - entityList[player.id].health;

        // detect out of stage for every entity
        for (var i = 0; i < allCurrentEntities.length; i++) {
            if (this.outOfStageTest(entityList[allCurrentEntities[i]])) {
                var rand = Math.random() * 3;
                if (rand <= 1) {
                    var respawnPoint = "platform";
                }else if (rand <= 2) {
                    var respawnPoint = "tree";
                }else if (rand <= 3) {
                    var respawnPoint = "bottomLeft";
                }
                moveTo(entityList[allCurrentEntities[i]], respawnPosition(respawnPoint, "spawnPoints") );
                socket.emit("increaseScore", {"entity": entityList[allCurrentEntities[i]].lastHit, "val": 1});
            }
        }
        this.loop++;
    },
    outOfStageTest : function(entity){
        // find the out of bounds (oosObject) and copy its dimensions
        geoLayer = findByProperty(level[currentLevel].layers, "name", "geo");
        oosObject = findByProperty(level[currentLevel].layers[geoLayer].objects, "name", "outOfStage");
        stageBounds = {
            "x" : level[currentLevel].layers[geoLayer].objects[oosObject].x / 2,
            "y" : level[currentLevel].layers[geoLayer].objects[oosObject].y / 2,
            "width" : level[currentLevel].layers[geoLayer].objects[oosObject].width / 2,
            "height" : level[currentLevel].layers[geoLayer].objects[oosObject].height / 2
        }
        // check if entity is out of bounds
        if (entity.position.x > stageBounds.x && -1 * entity.position.y > stageBounds.y &&
            entity.position.x < stageBounds.x + stageBounds.width && -1 * entity.position.y < stageBounds.y + stageBounds.height) {
            var inside = false;
        }else {
            var inside = true;
        }
        return inside;
    }
};
