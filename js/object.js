/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//data in each block
function Block(stObj, p, background) {
    this.p = {
        x: p.x,
        y: p.y
    };
    //entity objs on the block (eg. player, enemy ...)
    this.objs = [];
    //static object on the block (eg. dirt, rock ...)
    this.stObj = stObj;
    //background on the block (eg. flowers)
    this.background = background;
}

//object
function Obj(p, diameter, hp, color) {
    //object color
    this.color = color;
    //object health
    this.hp = hp;
    //object diameter
    this.diameter = diameter;
    //object radius
    this.radius = diameter / 2;
    //object position
    this.p = {
        x: p.x,
        y: p.y
    };
    //block occupied
    this.blocks = [];
}

Obj.prototype.updateBlock = function (self, newBlock, renderBlock, clearBlock) {
    //remove object  reference in all occupied block
    this.destroy(self, clearBlock);

    //update new block data 
    this.blocks = newBlock;
    //add object reference to new occupied block
    this.blocks.forEach(function (b) {
        //testing purpose
        if (renderBlock !== undefined)
            renderBlock(b, 'blue');
        //if type is not undefined, then the object is a entity
        if (self.type !== undefined) {
            b.objs.push(self);
        }
    });
};
Obj.prototype.destroy = function (self, clearBlock) {
    //check if the object is a entity
    var isEntity = (self.type !== undefined);
    if (isEntity || clearBlock) {
        //remove object  reference in all occupied block
        this.blocks.forEach(function (b) {
            if (isEntity) {
                var i = b.objs.indexOf(self);
                if (i !== -1) {
                    //for testing
                    if (clearBlock !== undefined)
                        clearBlock(b);
                    b.objs.splice(i, 1);
                }
            }else{
                clearBlock(b);
            }
        });
    }
};

//bullet extend of object
function Bullet(p, v, property, owner) {
    Obj.call(this, p, property.size, property.hp,property.color);
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

//player extend of object
function Entity(p, w, h, hp, jumpFuel, digpower, weapon, target, speed, type,color) {
    //object type
    this.type = type;
    //call super class constructor
    Obj.call(this, p, w, hp,color);
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
    if(this.jf<20){
        this.jf=20;
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


//weapon
function Weapon(speed, size, dmg, travelRange, cooldown, consume, hp, color) {
    this.speed = speed; //bullet travel speed
    this.size = size; //bullet size
    this.dmg = dmg; //damage doing
    this.travelRange = travelRange; //travel range
    this.cd = cooldown; //fire speed
    this.consume = consume; //energy consume
    this.hp = hp;
    this.color=color;
}