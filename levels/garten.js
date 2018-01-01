level[currentLevel].gameCode = {
    "loop" : 0,
    init : function() {
        entityList[player.id].maxHealth = 100;
        entityList[player.id].health = 100;
        entityList[player.id].loadWeapon("usr/weapons/MachineGun.json");
    },
    update : function(){
        if (this.loop == 0) {
            this.init();
        }
        // your code goes here
        for (var i = 0; i < allCurrentEntities.length; i++) {
            if (entityList[allCurrentEntities[i]].health <= 0) {

                moveTo(entityList[allCurrentEntities[i]], respawnPosition("quote") );
                socket.emit("increaseScore", {"entity": entity.lastHit, "val": 1});
            }
        }
        this.loop++;
    }
};
