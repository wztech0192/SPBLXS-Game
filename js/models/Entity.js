//player extend of object
function Entity(p, w, h, hp, jumpFuel, digpower, weapon, target, speed, type, color) {
    //object type
    this.type = type;
    //call super class constructor
    Obj.call(this, p, w, hp, color);
    //shoot at
    this.target = target;
    //weapon property: bullet size, bullet speed, damage, lifespan, cooldown, fire
    this.weapon = weapon;
    //-1 indicate there is no clicking
    this.click = -1;
    this.width = w;
    this.height = h;
    this.halfHeight = h / 2;
    this.halfWidth = w / 2;
    //player movement
    this.up = false;
    this.left = false;
    this.right = false;
    this.down = false;
    //player moved
    this.moved = true;
    //jump fuel
    this.initJF = jumpFuel;
    this.jf = jumpFuel;
    this.dp = digpower;
    this.speed = speed;
    this.fire = false;
}
Entity.prototype = Object.create(Obj.prototype);
Entity.prototype.constructor = Obj;

//player move function

Entity.prototype.recoverJump = function () {
    if (this.jf < 20) {
        this.jf = 20;
    }
    if (this.jf < this.initJF) {
        this.jf += 2;
    }
};

//count shooting cool down
Entity.prototype.setCD = function () {
    var self = this;
    self.fire = true;
    setTimeout(function () {
        self.fire = false;
    }, self.weapon.cd);
};
