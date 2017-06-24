localBullets = new Array();

function spawnBullet(owner, props){
	localBullets[localBullets.length] = new Object();
    // var texture = new THREE.TextureLoader().load( 'textures/crate.gif' );
	localBullets[localBullets.length-1].geometry = new THREE.BoxBufferGeometry( props.bullet.width, props.bullet.height, props.bullet.depth );
	localBullets[localBullets.length-1].material = new THREE.MeshBasicMaterial( { color: 0xffffff/*map: texture*/ } );
	localBullets[localBullets.length-1].mesh = new THREE.Mesh( localBullets[localBullets.length-1].geometry, localBullets[localBullets.length-1].material );
    localBullets[localBullets.length-1].mesh.position.set(props.origin.x, props.origin.y, props.origin.z);
	localBullets[localBullets.length-1].mesh.rotation.z = -1 * angleBetweenObjects(THREEx.ObjCoord.cssPosition(entityList[player.id].mesh, camera,renderer), cursor);
	scene.add( localBullets[localBullets.length-1].mesh );
	localBullets[localBullets.length-1].timer = 0;
	localBullets[localBullets.length-1].collisionCounter = 0;
	localBullets[localBullets.length-1].currentSpeed = props.speed;
	localBullets[localBullets.length-1].props = props;
	localBullets[localBullets.length-1].props.rotation = -1 * angleBetweenObjects(THREEx.ObjCoord.cssPosition(entityList[player.id].mesh, camera,renderer), cursor);

	// calculate the knockback at the moment in time the player shoots / aka 0

	var tempX = math.eval( localBullets[localBullets.length-1].props.trajectory.x.replace(/\$/g, localBullets[localBullets.length-1].timer) );
	var tempY = math.eval( localBullets[localBullets.length-1].props.trajectory.y.replace(/\$/g, localBullets[localBullets.length-1].timer) );
	entityList[player.id].velocity.y -= -1 * tempX * Math.cos(localBullets[localBullets.length-1].props.rotation) - tempY * Math.sin(localBullets[localBullets.length-1].props.rotation) * props.knockback;
	entityList[player.id].velocity.x -= -1 * tempX * Math.sin(localBullets[localBullets.length-1].props.rotation) + tempY * Math.cos(localBullets[localBullets.length-1].props.rotation) * props.knockback;
}

function updateBullets() {
	for (var i = 0; i < localBullets.length; i++) {
		var tempX = math.eval( localBullets[i].props.trajectory.x.replace(/\$/g, localBullets[i].timer) );
		var tempY = math.eval( localBullets[i].props.trajectory.y.replace(/\$/g, localBullets[i].timer) );
		var tempZ = math.eval( localBullets[i].props.trajectory.z.replace(/\$/g, localBullets[i].timer) );
		localBullets[i].mesh.position.x = localBullets[i].props.origin.x + tempX * Math.cos(localBullets[i].props.rotation) - tempY * Math.sin(localBullets[i].props.rotation);
        localBullets[i].mesh.position.y = localBullets[i].props.origin.y + tempX * Math.sin(localBullets[i].props.rotation) + tempY * Math.cos(localBullets[i].props.rotation);
        localBullets[i].mesh.position.z = localBullets[i].props.origin.z + tempZ;

		var counter = 0;
		var percentage = localBullets[i].timer / localBullets[i].props.decay * 100;
		var usedAnimation = 0;
		for (var j = 0; j < localBullets[i].props.animation.length; j++) {
			counter += localBullets[i].props.animation[j].duration;
			// console.log(counter + " " + percentage + "% -- " + localBullets[i].props.decay + " " + localBullets[i].timer);
			if (percentage >= counter - localBullets[i].props.animation[j].duration &&
				percentage < counter) {
					usedAnimation = j;
			}
		}
		localBullets[i].material.color.setHex(hex23js(localBullets[i].props.animation[usedAnimation].color));
		// -- Collisionssystem --
		// tempCollision = e2mCollision(localBullets[i].mesh.position);
		// if (tempCollision.bottom != 0 || tempCollision.top != 0 ||
		// 	tempCollision.left != 0 || tempCollision.right != 0 ||
		// 	tempCollision.inside != 0) {
		// 		localBullets[i].collisionCounter += 1;
		// }
		// if (localBullets[i].collisionCounter >= localBullets[i].props.collision.counter){
		// 	localBullets[i].timer = localBullets[i].props.decay;
		// }

        localBullets[i].timer++;
        if (localBullets[i].timer >= localBullets[i].props.decay){
            scene.remove(localBullets[i].mesh);
			localBullets.splice( localBullets.indexOf(localBullets[i]), 1 );
        }
	}
}

function hex23js(input) { // hex to threejs hex
	output = input.replace("#", "0x");
	return output;
}
