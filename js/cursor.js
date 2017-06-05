cursor = new Object();
document.onmousemove = function(e){
    cursor.x = e.pageX;
    cursor.y = e.pageY;
}

document.onmousedown = function() {
    cursor.down = true;
}

document.onmouseup = function() {
    cursor.down = false;
}

function angleBetweenObjects(p1, p2) {
    angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    return angle;
}
