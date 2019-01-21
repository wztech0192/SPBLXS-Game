
function Starfield() {
    this.fps = 30;
    this.canvas = null;
    this.width = 0;
    this.height = 0;
    this.minV = 15;
    this.maxV = 30;
    this.S = 50;
    this.intervalId = 0;
}

//	The main function - initialises the starfield.
Starfield.prototype.initialise = function (div) {
    var self = this;

    //	Store the div.
    this.containerDiv = div;
    self.width = window.innerWidth;
    self.height = window.innerHeight;

    window.addEventListener('resize', function () {
        self.width = window.innerWidth;
        self.height = window.innerHeight;
        self.canvas.width = self.width;
        self.canvas.height = self.height;
    });

    //	Create the canvas.
    var canvas = document.createElement('canvas');
    div.appendChild(canvas);
    this.canvas = canvas;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
};

Starfield.prototype.start = function () {

    //	Create the stars.
    var S = [];
    for (var i = 0; i < this.S; i++) {
        S[i] = new Star(Math.random() * this.width, Math.random() * this.height, Math.random() * 3 + 1,
                (Math.random() * (this.maxV - this.minV)) + this.minV);
    }
    this.S = S;

    var self = this;
    //	Start the timer.
    this.intervalId = setInterval(function () {
        self.update();
    }, 3000 / this.fps);
};

Starfield.prototype.stop = function () {
    clearInterval(this.intervalId);
};

Starfield.prototype.getRandomColor = function () {
    return (100 + Math.round(Math.random() * 100));
};

Starfield.prototype.update = function () {
    var dt = 1 / this.fps;
    //	Get the drawing context.
    var ctx = this.canvas.getContext("2d");

    //	Clear the background.
    ctx.fillStyle = 'rgb(20, 5, 33)';
    ctx.fillRect(0, 0, this.width, this.height);

   
    //loop through each star and update its location
    for (var i = 0; i < this.S.length; i++) {
        ctx.fillStyle = ('rgba(' + this.getRandomColor() + "," + (0) + ',' + this.getRandomColor() + ',' + (0.5 + Math.random() * 0.5) + ')');


        var star = this.S[i];
        var v = dt * star.velocity;
        star.y += v;
        star.x += v;
        //	If the star has moved from the bottom of the screen, spawn it at the top.
        if (star.y > this.height) {

            star.update(Math.random() * this.width, Math.random() * this.height / 2);
        }
        if (star.x > this.width) {
            star.update(Math.random() * this.width, Math.random() * this.height / 2);
        }
        ctx.fillRect(star.x, star.y, star.size, star.size);
    }
};

function Star(x, y, size, velocity) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.velocity = velocity;
}
//update star
Star.prototype.update = function (x, y) {
    this.x = x;
    this.y = y;
};
