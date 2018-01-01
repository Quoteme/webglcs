// create a new canvas, in which all the images are cutted to pieces in
converterCanvas = document.createElement("canvas");
// make this canvas invisible, so it does not distract the user
converterCanvas.style.display = "none";

// this function takes in an image, then cuts it into a portion of the previous image and returns a new image
function cutImg(image, x, y, width, height) {
    converterCanvas.width = width;
    converterCanvas.height = height;
    converterCanvas.getContext("2d").drawImage(image, -1 * x, -1 * y);

    var output = new Image();
	output.src = converterCanvas.toDataURL("image/png");

    return output;
}
// this function takes in an image and replicates it
function copyImg(canvas) {
    var output = new Image();
    output.src = canvas.toDataURL("image/png");

    return output;
}

function addImg(images, x, y) {
	converterCanvas.width = x + images[1].width;
    converterCanvas.height = y + images[1].height;

	converterCanvas.getContext("2d").drawImage(images[0].img, -1 * x, -1 * y);
}
