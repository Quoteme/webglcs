playerTags = new Object();

function PlayerHUD(props) {
    if (typeof props == "undefined")
        props = new Object();
    this.align = props.align || "center";
    this.textColor = props.textColor || "#e8e8e8";
    this.scoreColor = props.scoreColor || "#d8d888";
    this.objColor = props.objColor || "#bbb";
    this.objbgColor = props.objbgColor || "#000";
    this.healthColor = props.healthColor || "#890000";
    this.usedHealthColor = props.usedHealthColor || "#d80000";
    this.healthBorder = props.healthBorder || "#e8e8e8";
    this.font = props.font || "40px PressStart2p";
    this.healthBar = {
        x: 110,
        y: 96 - 40,
        w: 250,
        h: 40,
        b: 5 // border
    }
    if (typeof player != "undefined")
        this.entityID = props.entityID || player.id;
    else
        this.entityID = "missingID";
    this.elem = document.createElement("canvas");
    this.elem.style.position = "absolute";
    this.elem.style.left = props.posX || 20;
    this.elem.style.top = props.posY || 20;
    this.elem.setAttribute("class", "HUD");
    this.elem.width = props.width || 400;
    this.elem.height = props.height || 200;
    this.elem.style.opacity = props.opacity || 0.75;

    this.thumbnail = new Image();
    if (typeof entityList[this.entityID].weapon != "undefined" || typeof entityList[this.entityID].weapon != "string")
        this.currentWeaponName = entityList[this.entityID].weapon.name;
    else
        this.currentWeaponName = "";

        // temporary
        // this.elem.style.background = "#ffffff";

    document.body.appendChild(this.elem);
    this.ctx = this.elem.getContext('2d')
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;

    parent = this;

    function phUpdate(){
        parent.ctx.clearRect(0, 0, parent.elem.width, parent.elem.height);
        parent.ctx.fillStyle = parent.objColor;
        parent.ctx.fillRect(0, 0, 96, 96);
        parent.ctx.fillStyle = parent.objbgColor;
        parent.ctx.fillRect(5, 5, 86, 86);
        if (parent.entityID != "missingID"){
            parent.ctx.fillStyle = parent.healthColor;
            parent.ctx.fillRect(parent.healthBar.x, parent.healthBar.y, parent.healthBar.w, parent.healthBar.h);
            parent.ctx.fillStyle = parent.usedHealthColor;
            parent.ctx.fillRect(parent.healthBar.x, parent.healthBar.y, parent.healthBar.w / (entityList[parent.entityID].maxHealth / entityList[parent.entityID].health), parent.healthBar.h);
            parent.ctx.fillStyle = parent.healthBorder;
            parent.ctx.fillRect(parent.healthBar.x, parent.healthBar.y, parent.healthBar.w, parent.healthBar.b);
            parent.ctx.fillRect(parent.healthBar.x, parent.healthBar.y + parent.healthBar.h - parent.healthBar.b, parent.healthBar.w, parent.healthBar.b);
        }
        else {
            parent.ctx.fillStyle = parent.textColor;
            parent.ctx.fillText("No Entity ID", 110, 100);
        }

        if (typeof entityList[parent.entityID].weapon != "undefined" || typeof entityList[parent.entityID].weapon != "string" ){
            if (parent.currentWeaponName != entityList[parent.entityID].weapon.name) {
                parent.thumbnail.src = entityList[parent.entityID].weapon.thumbnail;
                parent.currentWeaponName = entityList[parent.entityID].weapon.name;
            }
            if (parent.thumbnail.complete) {
                parent.ctx.drawImage(parent.thumbnail, 5, 5, 86, 86);
            }
        }

        parent.ctx.textBaseline = "top";
        parent.ctx.font = parent.font;
        parent.ctx.textAlign="left";
        parent.ctx.fillStyle = parent.textColor;
        parent.ctx.fillText( entityList[player.id].ammo.toString().slice(-2) + "/" + entityList[player.id].maxAmmo.toString().slice(-2), parent.healthBar.x,10);
        parent.ctx.textAlign="right";
        parent.ctx.fillStyle = parent.scoreColor;
        parent.ctx.fillText( entityList[player.id].score, parent.elem.width - 40,10);

        requestAnimationFrame( phUpdate );
    }
    phUpdate();

    // copyImg(entityList[player.id].canvas).src

}

function playerTag(entity, color, font, bgcolor) {
    playerTags[name] = new simpleHUD({elemType: "span"});
    playerTags[name].elem.innerHTML = entity.name || "Entity";
    playerTags[name].elem.style.color = color || "#fff";
    playerTags[name].elem.style.backgroundColor = bgcolor || "#161616";
    parent = this;
    this.updatePTPostion = function() {
        if (playerTags[name].elem.innerHTML != entity.name) {
            playerTags[name].elem.innerHTML = entity.name;
        }
        parent.position = THREEx.ObjCoord.cssPosition(entity.mesh, camera,renderer);
        playerTags[name].elem.style.left	= (parent.position.x-playerTags[name].elem.offsetWidth /2)+'px';
        playerTags[name].elem.style.top     = (parent.position.y-playerTags[name].elem.offsetHeight/2)+'px';
        requestAnimationFrame(parent.updatePTPostion);
    }
    updatePTPostion();
}

function simpleHUD(props) {
    /*
        props.posX = X;
        props.posY = Y;
        props.width = W;
        props.height = H;
        props.align = top, left, down bottom, center
        props.color = #XXXXXX
    */
    if (typeof props == "undefined")
        props = new Object();

    this.textColor = props.textColor || "#fff";
    this.vars = props.vars;
    this.font = props.font || "Arial";
    this.fontSize = props.fontSize || 12;
    this.elemType = props.elemType || "canvas";

    this.elem = document.createElement(this.elemType);
    this.elem.style.position = "absolute";
    this.elem.width = props.width || 300;
    this.elem.height = props.height || 200;
    this.elem.style.left = props.posX || 0;
    this.elem.style.top = props.posY || 0;
    this.elem.setAttribute("class", "HUD");
    this.elem.style.opacity = props.opacity || 0.75;
    if (typeof props.background != "undefiend"){
        this.elem.style.background = props.background;
        this.elem.style.backgroundColor = props.background;
    }

    document.body.appendChild(this.elem);

    parent = this;

}

function removeHUD(element) {
    element.elem.remove();
    delete element;
}
