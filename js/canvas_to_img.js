converterCanvas = document.createElement("canvas");
converterCanvas.style.display = "none";
function cutImg(image, x, y, width, height) {
    converterCanvas.width = width;
    converterCanvas.height = height;
    converterCanvas.getContext("2d").drawImage(image, -1 * x, -1 * y);

    var output = new Image();
	output.src = converterCanvas.toDataURL("image/png");

    return output;
}
function copyImg(canvas) {
    var output = new Image();
    output.src = canvas.toDataURL("image/png");

    return output;
}
