// controls
function gamepadUpdate(e){
	let gamepads = [navigator.getGamepads()[0],navigator.getGamepads()[1],navigator.getGamepads()[2],navigator.getGamepads()[3]].filter(e=>e!=null)
	gamepads.forEach( (g,i) =>{
		// actions
			if(g.buttons[0].pressed) e[i].jump();
			if(g.buttons[2].pressed) e[i].shootWeapon();
			if(g.buttons[5].pressed) e[i].shootWeapon();
			if(g.buttons[9].pressed) pauseMenu();
		// movement
			// d-pad
				if(g.buttons[12].pressed) e[i].walkBack();
				if(g.buttons[13].pressed) e[i].walkFront();
				if(g.buttons[14].pressed) e[i].walkLeft();
				if(g.buttons[15].pressed) e[i].walkRight();
			// joystick
				if(g.axes[0]>0) e[i].walkRight(g.axes[0]);
				if(g.axes[0]<0) e[i].walkLeft(-1*g.axes[0]);
				if(g.axes[1]>0) e[i].walkBack(-1*g.axes[1]);
				if(g.axes[1]<0) e[i].walkFront(g.axes[1]);
			// gun-aim
				if(Math.abs(g.axes[2])>=0.4){
					cursor.active = false;
					cursor.x = window.innerWidth/2 + window.innerWidth/2 * g.axes[2];
				}
				if(Math.abs(g.axes[3])!=0.4){
					cursor.active = false;
					cursor.y = window.innerHeight/2 + window.innerHeight/2 * g.axes[3];
				}
				if(Math.abs(g.axes[2])>=0.4 || Math.abs(g.axes[3])>=0.4){
					cursor.active = true;
				}
		// animation
			if(	g.axes[0]!=0 ||
				g.axes[1]!=0 ||
				g.buttons[12].pressed ||
				g.buttons[13].pressed ||
				g.buttons[14].pressed ||
                g.buttons[15].pressed) e[i].usedAnimation = "run";
	})
}
