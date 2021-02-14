//weapon
function Weapon(speed, size, dmg, travelRange, cooldown, consume, hp, color) {
    this.speed = speed; //bullet travel speed
    this.size = size; //bullet size
    this.dmg = dmg; //damage doing
    this.travelRange = travelRange; //travel range
    this.cd = cooldown; //fire speed
    this.consume = consume; //energy consume
    this.hp = hp;
    this.color = color;
}
