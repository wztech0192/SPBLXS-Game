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
        if (renderBlock !== undefined) renderBlock(b, "blue");
        //if type is not undefined, then the object is a entity
        if (self.type !== undefined) {
            b.objs.push(self);
        }
    });
};
Obj.prototype.destroy = function (self, clearBlock) {
    //check if the object is a entity
    var isEntity = self.type !== undefined;
    if (isEntity || clearBlock) {
        //remove object  reference in all occupied block
        this.blocks.forEach(function (b) {
            if (isEntity) {
                var i = b.objs.indexOf(self);
                if (i !== -1) {
                    //for testing
                    if (clearBlock !== undefined) clearBlock(b);
                    b.objs.splice(i, 1);
                }
            } else {
                clearBlock(b);
            }
        });
    }
};
