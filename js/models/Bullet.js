//bullet extend of object
function Bullet(p, v, property, owner) {
    Obj.call(this, p, property.size, property.hp, property.color);
    //owner of the bullet
    this.owner = owner;
    //bullet property: size, speed, damage, and lifespan
    this.property = property;
    this.travelRange = property.travelRange;
    //velocity
    this.v = v;
}
Bullet.prototype = Object.create(Obj.prototype);
Bullet.prototype.constructor = Obj;
//bullet move
Bullet.prototype.move = function (blockCanvas) {
    //update x and y by speed times velocity
    this.p.x += this.v.x;
    if (this.p.x >= blockCanvas.width) {
        this.p.x -= blockCanvas.width;
    } else if (this.p.x < 0) {
        this.p.x += blockCanvas.width;
    }
    this.p.y += this.v.y;
    //reduce hp when travel
    this.travelRange--;
};
//return if collision block exist
Bullet.prototype.getCollideBlock = function () {
    var owner = this.owner;
    //collided blocks
    var cblocks = [];
    this.blocks.forEach(function (b) {
        if (b.stObj !== null || (b.objs.length > 0 && b.objs[0].type !== owner)) {
            //push into collided blocks array if there is a obj in this block
            cblocks.push(b);
        }
    });
    //return collided blocks array
    return cblocks;
};
