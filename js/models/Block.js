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
