const nearest = (
    e,
    objs = allCurrentEntities.map(i=>entityList[i]),
    filter =(i=>i.type=="player"),
    radius = 100
)=>{
    // e is the entity that is chasing
    // objs is the other objects in the scene
    let prey = objs.filter(filter).sort( (a,b) => math.hypot(
        a.position.x-e.position.x,a.position.y-e.position.y,a.position.z-e.position.z
        )-math.hypot(
            b.position.x-e.position.x,b.position.y-e.position.y,b.position.z-e.position.z
        )
    ).filter(i=>math.hypot(i.position.x-e.position.x,i.position.y-e.position.y,i.position.z-e.position.z)<=radius).filter(i=>i.id!=e.id);
    return prey;
}
const distance = (e1,e2) => math.hypot(
    e2.position.x-e1.position.x,
    e2.position.y-e1.position.y,
    e2.position.z-e1.position.z);

const chase = (
    e,
    objs,
    filter,
    radius
)=>{
    let closest = nearest(e,objs,filter,radius);
    if(closest.length > 0){
        let step = {
            'x':closest[0].position.x-e.position.x,
            'y':closest[0].position.y-e.position.y,
            'z':closest[0].position.z-e.position.z,
        }
        e.moveRight(math.sign(step.x)*closest[0].speedOnFoot);
        e.moveBehind(-math.sign(step.z)*closest[0].speedOnFoot);
    }
}

const gooChase = (
    e,
    objs,
    filter,
    radius
)=>{
    let closest = nearest(e,objs,filter,80);
    if(closest.length > 0){
        if(e.rounds == 0) e.rounds = Math.random()*2*Math.PI;
        if(e.ammo == 0) e.ammo = Math.random()/2+1;
        if(distance(e,closest[0])>5){
            let step = {
                'x':closest[0].position.x-e.position.x,
                'y':closest[0].position.y-e.position.y,
                'z':closest[0].position.z-e.position.z,
            }
            e.usedAnimation = "run";
            e.moveRight(math.sign(step.x)*closest[0].speedOnFoot*math.abs(math.sin(e.rounds+performance.now()/1000*e.ammo)));
            e.moveBehind(-math.sign(step.z)*closest[0].speedOnFoot*math.abs(math.sin(e.rounds+performance.now()/1000*e.ammo)));
        }
        if(distance(e,closest[0])<10){
            e.usedAnimation = "attack";
            e.reloadTimer--;
            if(e.reloadTimer<=0){
                closest[0].health-=10;
                e.reloadTimer=100;
            }
        }
    }else{
        e.usedAnimation = "stand";
    }
}

var aiPatterns={
    "goo": (param)=>{
        gooChase(...param);
    },
}
