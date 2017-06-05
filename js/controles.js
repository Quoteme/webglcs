var keyboard = new THREEx.KeyboardState();

function controle(entity){
    // movement
    if(keyboard.pressed("space")){
        entity.velocity.y -= 0.04;
    }
    if(keyboard.pressed("space") && entity.collision.bottom != 0){
        entity.velocity.y = -2 * (1-entity.collision.liquid);
    }
    if(keyboard.pressed("A") && !entity.collision.left){
        if (entity.collision.bottom != 0) {
            entity.velocity.x -= entity.speedOnFoot;
        }else {
            entity.velocity.x -= entity.speedInAir;
        }
    }
    if(keyboard.pressed("D") && !entity.collision.right){
        if (entity.collision.bottom != 0) {
            entity.velocity.x += entity.speedOnFoot;
        }else {
            entity.velocity.x += entity.speedInAir;
        }
    }
    if(keyboard.pressed("shift")){

    }

    // animation
    if(entity.collision.bottom == 0 && keyboard.pressed("W"))
        entity.usedAnimation = "fallLookUp";
    else if(entity.collision.bottom == 0 && keyboard.pressed("S"))
        entity.usedAnimation = "fallLookDown";
    else if(keyboard.pressed("W") && keyboard.pressed("A") || keyboard.pressed("W") && keyboard.pressed("D"))
        entity.usedAnimation = "upRun";
    else if(entity.collision.bottom == 0 && entityList[player.id].velocity.y >= 0)
        entity.usedAnimation = "ascend";
    else if(entity.collision.bottom == 0 && entityList[player.id].velocity.y < 0)
        entity.usedAnimation = "fall";
    else if(keyboard.pressed("D") || keyboard.pressed("A"))
        entity.usedAnimation = "run";
    else if(keyboard.pressed("S"))
        entity.usedAnimation = "look";
    else if (keyboard.pressed("W"))
        entity.usedAnimation = "up"
    else
        entity.usedAnimation = "stand";

    // camera
    if(keyboard.pressed("N")){
        camera.position.z += 4;
    }
    if(keyboard.pressed("M")){
        camera.position.z -= 4;
    }
    if (cursor.down) {
        entityList[player.id].shootWeapon();
    }
    entityList[player.id].reloadTimer--;

    // other stuff
    // if(keyboard.pressed("L")){
    //     var level = prompt("enter Level name:", "levels/xxx.json");
    //     var slot = prompt("enter storage slot for level:\ncurrent slot: " + currentLevel, (currentLevel - 1) + 2);
    //     changeLevel(level, slot);
    // }

}

pressedDowncounter = false;
keyboard.domElement.addEventListener('keydown', function(event){
    pressedDowncounter = !pressedDowncounter;
    if (pressedDowncounter){
        if (document.getElementsByClassName("menu")[0].style.display == "none"){
            if(keyboard.eventMatches(event, 'escape')){
                pauseMenu();
            }
            if(keyboard.eventMatches(event, 'T')){
                pauseMenu();
                showMenuPart('Chat');
            }
        }else {
            if(keyboard.eventMatches(event, 'escape')){
                pauseMenu();
            }
        }
    }
});
