/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//modified linked list

//LinkedList data structure
function Node(val) {
    this.val = val;
    this.next = null;
    this.previous = null;
}
function LinkedList() {
    this.first = null;
    this.last = null;
    this.size = 0;
}
LinkedList.prototype.push = function (val) {
    if (this.first === null) {
        this.first = new Node(val);
        this.last = this.first;
    } else {
        this.last.next = new Node(val);
        this.last.next.previous = this.last;
        this.last = this.last.next;
    }
    this.size++;
};
LinkedList.prototype.shift = function () {
    if (this.first !== null) {
        if (this.first === this.last) {
            this.first = null;
            this.last = null;
        } else {
            this.first = this.first.next;
            this.first.previous = null;
        }
        this.size--;
    }
};
LinkedList.prototype.remove = function (node) {
    if (node !== null) {
        if (node !== this.first) {
            node.previous.next = node.next;
            if (node !== this.last) node.next.previous = node.previous;
            else this.last = node.previous;
            this.size--;
        } else {
            this.shift();
        }
    }
};
LinkedList.prototype.removeByValue = function (val) {
    if (!this.isEmpty()) {
        var temp = this.first;
        while (temp !== null && temp.val !== val) {
            temp = temp.next;
        }
        if (temp !== null) {
            this.remove(temp);
        }
    }
};
LinkedList.prototype.connect = function (list) {
    if (!list.isEmpty()) {
        if (this.isEmpty()) {
            this.first = list.first;
            this.last = list.last;
            this.size = list.size;
        } else {
            this.last.next = list.first;
            list.first.previous = this.last;
            this.last = list.last;
            this.size += list.size;
        }
    }
};
LinkedList.prototype.clear = function () {
    this.size = 0;
    this.first = null;
    this.last = null;
};
LinkedList.prototype.isEmpty = function () {
    return this.size <= 0;
};
LinkedList.prototype.forEach = function (callBackFunction) {
    var node = this.first;
    while (node !== null) {
        callBackFunction(node);
        node = node.next;
    }
};

//useful function

//return a random boolean
function randBoolean() {
    return Math.round(Math.random()) <= 0;
}

//return velocity of two point
function getVelocity(p1, p2, speed) {
    var xDif = p1.x - p2.x,
        yDif = p1.y - p2.y,
        angle = Math.atan2(xDif, yDif) / Math.PI,
        xS = -Math.sin(angle * Math.PI) * speed,
        yS = -Math.cos(angle * Math.PI) * speed;
    return {
        x: xS,
        y: yS
    };
}

function getOrbitalPath(p1, p2, speed) {
    var xDif = p1.x - p2.x,
        yDif = p1.y - p2.y,
        angle = Math.atan2(xDif, yDif) / Math.PI,
        xS = -Math.cos(angle * Math.PI) * speed,
        yS = Math.sin(angle * Math.PI) * speed;
    return {
        x: xS,
        y: yS
    };
}
function circularPath(p1, p2, speed, adjustAngle) {
    var path = adjustPathPoint(p1, p2, adjustAngle);
    orbitalPath(p1, path, speed);
}
function adjustPathPoint(p1, p2, adjustAngle) {
    var angle = findAngle(p1, p2),
        distance = findDist(p1, p2),
        angleRad = ((angle - adjustAngle) * Math.PI) / 180;
    return findAdjustAnglePoint(p2, distance, angleRad);
}
function findAdjustAnglePoint(p, distance, angleRad) {
    var newX = p.x + distance * Math.cos(angleRad),
        newY = p.y + distance * Math.sin(angleRad);
    return new Point(newX, newY);
}

function testCollision(p1, p2, ballSize) {
    return ballSize * p1.radius + ballSize * p2.radius - findDist(p1, p2) >= 0;
}
function findAngle(p1, p2) {
    var rad = Math.atan2(p1.y - p2.y, p1.x - p2.x),
        angle = rad * (180 / Math.PI);
    return angle < 0 ? angle + 360 : angle;
}
function findDist(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
