/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/*----------------GLOABL VARIABLES----------------*/
var start = false;

var canvas;                //canvas
var ctx;          //canvas context
var bldCanvasColor;
var energyCanvasColor;
var flyCanvasColor;


var playerName;                    //player name

var mouse = {//mouse location
    x: 0,
    y: 0,
    //get mouse x and y base on block map
    mapXY: function () {
        if (start) {
            return {
                x: (player.p.x) + mouse.x - canvas.width / 2,
                y: (player.p.y + blockSize / 2) + mouse.y - canvas.height / 2
            };
        }
        return null;
    }
};
var mapSize = {//map size x*y
    x: 600,
    y: 300
};

var blockSize = 15;                         //size of each block. Make sure all speed cannot greater than block size
var movementSpeed = blockSize / 5;                      //movement speed
var jumpFuel = 300;                         //jump power
var playerWeaponList = [//player weapon (speed, size, dmg, travelRange, cooldown, consume, hp, color)
    //rifle
    new Weapon(movementSpeed * 2, blockSize / 4, 5, blockSize * 5, 150, 1, 1, 'rgb(100,255,255)'),
    //snipe
    new Weapon(movementSpeed * 4, blockSize / 2, 20, blockSize * 10, 1000, 30, 3, 'rgb(10,255,255)'),
    //super weapon
    new Weapon(blockSize / 2, blockSize * 2, 20, blockSize * 30, 20, 1, 5, '#0a4960')
];
var initEnergy = 2000;
var energy = initEnergy;                          //consuming energy
var playerHP = 400;                         //player health
var digpower = 5;                             //digging power
var blockhp = 10;                             //default block health
var energyShield = false;                        //use energy to replace hp
var spawnPoint = {x: mapSize.x * blockSize / 2, //player spawn point
    y: (mapSize.y * blockSize / 2.2)
};

var player;                                 //player
var tool = 1;                                 //selected tool (e.g. block destroyer, gun...)
var toolName = ['rifle', 'sniper', 'hack weapon'];
var blockMap;                               //data structure to store each block's data
var animate;                                //animating
var blockCanvas;                            //block canvas for block background
var blockCtx;                               //block context for drawing

var bulletList = new LinkedList();          //bullet data structure
var lootList = new LinkedList();              //loots
var bloodList = new LinkedList();
var enemyList = new LinkedList();            //enemy list
var enemySpawnSize = 5;
var spawn = enemySpawnSize;
var wait = false;
var boss = false;

//(speed, size, dmg, travelRange, cooldown, consume, hp, color) 
//enemy attribute
var enemyWeapon = [
    //enemy1
    new Weapon(movementSpeed, blockSize / 4, 5, blockSize * 40, 600, 0, 2, 'white'),
    //enemy2
    new Weapon(movementSpeed * 1.4, blockSize / 2, 5, blockSize * 40, 1500, 0, 5, 'white'),
    //enemy3
    new Weapon(movementSpeed, blockSize * 3, 5, blockSize * 40, 100, 0, 5, '#0a4960'),
    //enemy3
    new Weapon(movementSpeed * 3, blockSize / 3, 2, blockSize * 50, 1, 0, 4, '#0a4960'),
    //enemy3
    new Weapon(movementSpeed * 0.8, blockSize * 8, 100, blockSize * 60, 4000, 0, 300, '#0a4960')
];


var lastLoop = new Date();                  //use to calculate fps
var thisLoop = new Date();                  //use to calculate fps
var fps;                                    //measure frame rate per second

var surviveTime = 0;                          //second player survived
var score = 0;                                //player score
var godMode = false;                         //god mode allow player not dying
var testing = false;                           //active game testing and debugging
var die=false;


/*----------------READY EVENT----------------*/
$(document).ready(function () {


    canvas = $('canvas')[0];
    ctx = canvas.getContext("2d");

    //play game button
    $('#pg').click(function () {
        if (!start) {
            //set player name
            playerName = $('#playername').find('input').val();
            if (playerName.trim() === '') {
                //if player name is empty ask if player when to play as anonymous
                if (confirm('Play as Anonymous?')) {
                    playerName = 'Anonymous';
                    $(this).text('GOOD LUCK!!');
                    gameStart();
                }
            } else {
                $(this).text('GOOD LUCK!!');
                gameStart();
            }
        } else if (player.hp < 0) {
            //show restart button and restart the game when game over
            $('#restart').show();
	    die=false;
            restart();
        } else {
            pause_resume_Game();
        }

        if (start) {
            $("#player").fadeIn('easing');
            $("#menu").addClass('menuhide');
            $("#myCanvas").fadeIn('easing');
            $("#pause").fadeIn('easing');
            $('#itemContent').fadeIn('easing');
            $('footer').fadeOut('easing');
        }
    });



    //pause button
    $("#pause").click(function () {
        if (player.hp > 0) {
            $('#pg').text('Resume Game');
            $('.menulegend').text('PAUSE');
        } else {
            $('#pg').text('Restart');
            $('.menulegend').text('YOU DIE');
        }
        $('#player').toggle();
        $("#menu").removeClass('menuhide');
        $("#myCanvas").fadeOut('easing');
        $('#itemContent').fadeOut('easing');
        $("#pause").hide();
        $('footer').fadeIn('easing');
        pause_resume_Game();
    });

    //restart button
    $('#restart').click(function () {
        //restart game if player confirmed
        if (confirm('Are you sure to restart?')) {
            restart();
            $("#player").fadeIn('easing');
            $("#menu").addClass('menuhide');
            $("#myCanvas").fadeIn('easing');
            $("#pause").fadeIn('easing');
            $('#itemContent').fadeIn('easing');
        }
    });
    //show contact Information
    $('.cInfo').click(function () {
        $('.contactInfo').fadeIn('easing');
    });

    //change map size selection
    $('.mapsize').click(function () {
        $('.mapselect').removeClass('mapselect');
        $(this).addClass('mapselect');
    });

    //show scoreboard when click on score board button
    $("#scoreB1").click(function () {
        //populate table by database value
        $.post('scoreBoard.php').done(function (data) {
            var tbody = "";
            data = $.parseJSON(data);
            $(data).each(function (i, v) {
                tbody += "<tr><td>" + (i + 1) + "</td><td>" + v.name + "</td><td>" + v.score + "</td><td>" + v.survivetime + "</td></tr>";
            });
            $(".scoreboard tbody").html(tbody);
            buttonContent($(".scoreboard"), true);
        });
    });

    //allow scoreboad fade when click
    $(".scoreboard").click(function () {
        buttonContent($(this), false);
    });

    $('#cInfo').click(function () {
        buttonContent($("#contactInfo"), true);
       // $("#contactInfo p").fadeIn('easing');
    });
    $('#contactInfo').click(function () {
        buttonContent($(this), false);
        //$("#contactInfo p").fadeOut('easing');
    });
     $('#gInfo').click(function () {
        buttonContent($("#GameInfo1"), true);
       // $("#contactInfo p").fadeIn('easing');
    });
    $('#GameInfo1').click(function () {
        buttonContent($(this), false);
        //$("#contactInfo p").fadeOut('easing');
    });
    $('#dInfo').click(function () {
        buttonContent($("#debug"), true);
       // $("#contactInfo p").fadeIn('easing');
    });
    $('#debug').click(function () {
        buttonContent($(this), false);
        //$("#contactInfo p").fadeOut('easing');
    });
    

    //show button content when click or hide content
    function buttonContent(btn, show) {
        if (show) {
            btn.addClass('btnShow');
            $("#menu").addClass('menuhide');
        } else {
            btn.removeClass('btnShow');
            $("#menu").removeClass('menuhide');
        }
    }

    //item log click event
    $('#itemContent th').click(function () {
        tool = $(this).index() + 1;
        player.weapon = playerWeaponList[tool - 1];
        $('.select_weapon').removeClass('select_weapon');
        $(this).addClass('select_weapon');
    });

    //disable right click
    $('body').on('contextmenu', '*', function () {
        return false;
    });
    //click event
    $(canvas).mousedown(function (e) {
        if (start) {
            //1 -> left click
            //2 -> middle click
            //3 -> right click
            player.click = e.which;
        }
    }).mouseup(function () {
        if (start) {
            //-1 will close click event
            player.click = -1;
        }
    }).mousemove(function (e) {
        if (start) {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        }
    });

    /*  //click event
     canvas.addEventListener('touchstart', function (e) {
     console.log('hi');
     if (start) {
     //1 -> left click
     //2 -> middle click
     //3 -> right click
     player.click = 1;
     }
     }, false);
     canvas.addEventListener('touchend', function () {
     if (start) {
     //-1 will close click event
     player.click = -1;
     }
     }, false);
     canvas.addEventListener('touchmove', function (e) {
     if (start) {
     mouse.x = e.touches[0].clientX;
     mouse.y = e.touches[0].clientY;
     console.log(mouse.x);
     }
     }, false);
     
     window.addEventListener('deviceorientation', function (event) {
     console.log(event.alpha + ' : ' + event.beta + ' : ' + event.gamma);
     });*/

    //adjust canvas when user resize the browser
    $(window).resize(resizeEvent);

    //moving event
    window.onkeyup = function () {
        if (start) {
            var keyCode = this.event.keyCode;
            switch (keyCode) {
                case 68: //d
                    player.right = false;
                    break;
                case 83: //s
                    player.down = false;
                    break;
                case 65: //a
                    player.left = false;
                    break;
                case 32: //space
                case 87: //w
                    player.up = false;
                    break;
            }
        }
    };
    window.onkeydown = function () {
        if (start) {
            var keyCode = this.event.keyCode;
            switch (keyCode) {
                case 68: //d
                    player.right = true;
                    break;
                case 83: //s
                    player.down = true;
                    break;
                case 65: //a
                    player.left = true;
                    break;
                case 32: //space
                case 87: //w
                    player.up = true;
                    break;
                case 84: //t
                    if (energyShield) {
                        energyShield = false;
                        $('#player').removeClass('playerShield');
                    } else if (energy >= 300) {
                        //only active if energy is over 300
                        energyShield = true;
                        $('#player').addClass('playerShield');
                    }
                    break;
                case 49://1
                case 81: //q 
                    $('#itemContent th').eq(0).click();
                    break;
                case 50://2
                case 69: //e
                    $('#itemContent th').eq(1).click();
                    break;
                case 27://esc
                    if(animate!==null)
                        $("#pause").click();
                    else $("#pg").click();
                    break;
                case 75:
                    if (indexConvert(player.p.x, mapSize.x) >= indexConvert(player.p.x + player.width, mapSize.x) && player.down) {
                        $('#player').css('background-color', '#0a4960');
                        player.weapon = playerWeaponList[2];
                        tool = 4;
                    }
            }

        }
    };

});


/*----------------INITIALIZING----------------*/
function setMap(x, y) {
    mapSize.x = x;
    mapSize.y = y;
    spawnPoint.x = mapSize.x * blockSize / 2;
    spawnPoint.y = mapSize.y * blockSize / 2.2;
}

function gameStart() {
    //change map size if map select is S or L. M is default
    switch ($('.mapselect').text()) {
        case 'S':
            setMap(200, 150);
            break;
        case 'L':
            setMap(700, 400);
            break;
    }
    $('#playername').hide();
    $('#restart').show();
    start = true;
    //create player
    player = new Entity(spawnPoint, blockSize, blockSize * 2, playerHP,
            jumpFuel, digpower, playerWeaponList[0], mouse, movementSpeed, 'player');
    //adjust canvas size to fit full screen
    resizeEvent();
    //create blockCanvas
    newBlockCanvas();
    //create horizontal array of blocks
    blockMap = new Array(mapSize.x);
    //generate block
    generateMap(0, mapSize.x);
    //set blur effect
    setBlur();

    //draw the game
    draw();
    //start counting
    secondCounter();
    //start animating
    gameLoop();
}

function createGradientColor() {
    // Create gradient
    bldCanvasColor = ctx.createLinearGradient(canvas.width, canvas.width / 2, canvas.width / 2, canvas.width / 2);
    bldCanvasColor.addColorStop(1, "rgba(0,0,0,0)");
    bldCanvasColor.addColorStop(0, "rgba(255, 12, 73,0.9)");
    // Create gradient
    energyCanvasColor = ctx.createLinearGradient(canvas.width, canvas.width / 2, canvas.width / 2, canvas.width / 2);
    energyCanvasColor.addColorStop(1, "rgba(0,0,0,0)");
    energyCanvasColor.addColorStop(0, "rgba(22, 248, 252,0.9)");
    // Create gradient
    flyCanvasColor = ctx.createLinearGradient(0, canvas.height / 3, 0, 0);
    flyCanvasColor.addColorStop(1, "rgba(0,0,0,0)");
    flyCanvasColor.addColorStop(0, "rgba(91, 0, 107,0.8)");
}

function setBlur() {
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'white';
}


//generate new map
function generateMap(start, end) {
    var horizontalLine = Math.round(mapSize.y / 1.8);
    for (var x = start; x < end; x++) {
        //vertical array of blocks
        var verticalArr = new Array(mapSize.y);

        var adjustLine = horizontalLine + Math.round(1 - Math.random() * 2);
        if (adjustLine > mapSize.y * 0.1 && adjustLine < mapSize.y * 0.8) {
            horizontalLine = adjustLine;
        }
        //generate each vertical block from half
        for (var y = horizontalLine, level = 1; y < mapSize.y; y++, level++) {

            //different layer different block
            var hp;
            var color;
            if (y < mapSize.y * (Math.random() * (0.7 - 0.6) + 0.6)) {
                hp = blockhp;
                color = 'rgba(168,168,168,0.7)';
            } else if (y < mapSize.y * (Math.random() * (0.85 - 0.7) + 0.7)) {
                hp = blockhp * 2;
                color = 'rgba(148,148,148,0.7)';
            } else if (y < mapSize.y * (Math.random() * (0.9 - 0.87) + 0.87)) {
                hp = blockhp * 4;
                color = 'rgba(128,0,128,0.7)';
            } else {
                hp = blockhp * 500;
                color = 'rgba(108,108,0,0.7)';
            }

            var p = {
                x: x * blockSize,
                y: y * blockSize
            };

            //create block object
            var obj = new Obj(p, blockSize, hp, color);
            //create new block,  2% chance to contain loot inside the block
            var block = (Math.round(Math.random() * 100) >= 98) ?
                    new Block(obj, p, 'loot') : new Block(obj, p);

            //draw block into block canvas
            renderBlock(obj, obj.color);
            //insert block
            verticalArr[y] = block;
        }
        //insert vertical blocks
        blockMap[x] = verticalArr;
    }
}

//pause or resume
function pause_resume_Game() {
    if (animate !== null) {
        //stop animation
        cancelAnimationFrame(animate);

        animate = null;
    } else {
        //start animation
        gameLoop();
    }
}

//count every one second
function secondCounter() {
    setInterval(function () {
        //only do if is animating
        if (animate !== null) {
            //energy consume *5 when open energy shield
            if (energyShield) {
                energy -= 6;
            }else if (energy >= player.hp) {
                energy--;
            }

            if (player.hp < 400) {
                player.hp++;
            }
            surviveTime++;
        }
    }, 1000);
}

function resizeEvent() {
    if (start) {
        // pause_resume_Game();
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        //set position for player
        $('#player').css({
            'left': (canvas.width / 2 - (player.width / 2)).toString() + 'px',
            'top': (canvas.height / 2 - (player.height * 0.75)).toString() + 'px',
            'width': player.width.toString() + 'px',
            'height': player.height.toString() + 'px'
        });
        createGradientColor();
    }
    //   pause_resume_Game();
}

/*----------------GAME CONTENT----------------*/

function gameLoop() {
    //loop game only if 
    if (godMode || (!die&& player.hp > 0)) {
        //update fps
        updateFPS();
        //player move action
        playerMove();
        //player click action
        playerClick();
        //refresh canvas;
        draw();
        //bullet event and render bullet
        bulletMove();
        //loot event
        lootMove();
        //spawn enemy
        spawnEnemy();
        //move enemy
        enemyMove();
        //move blood
        bloodMove();
        animate = requestAnimationFrame(gameLoop);
    } else {
        gameover();
    }
}

//game over
function gameover() {
    die=true;
    $.post('scoreUpload.php', {name: playerName, score: score, time: surviveTime}).done(function (data) {
        console.log(data);
    });

    $('#restart').hide();
    $('#pause').click();
    //refresh canvas;
    draw();
}

function restart() {
    clearObj(bulletList);
    clearObj(lootList);
    clearObj(enemyList);
    player.hp = playerHP;
    energy = initEnergy;
    player.p.x = spawnPoint.x;
    player.p.y = spawnPoint.y;
    surviveTime = 0;
    score = 0;
    player.moved = true;
    enemySpawnSize = 4;
    spawn = enemySpawnSize;
    wait = false;
    boss = false;
    pause_resume_Game();
}

function clearObj(list) {
    list.forEach(function (node) {
        var o = node.val;
        o.destroy(o);
        list.remove(node);
    });
}

//update fps
function updateFPS() {
    fps = 1000 / (thisLoop - lastLoop);
    lastLoop = thisLoop;
    thisLoop = new Date();
}



//convert block coordinate to map index
function indexConvert(val, limit) {
    var index = Math.round(val / blockSize);
    if (index < 0) {
        index = limit + index;
    } else if (index >= limit) {
        index -= limit;
    }
    return index;
}



/*----------------ALL CLICK FUNCTION----------------*/

//player click action
function playerClick() {
    switch (player.click) {
        //left click
        case 1:
            //tool using
            switch (tool) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    //shooting from player to mouse location
                    shootBullet(player, mouse.mapXY(), false);
                    break;
            }
            break;
            //middle click
        case 2:
            destroyObject();
            break;
            //right click
        case 3:
            //place block
            placeObject();
            break;
        default:
    }
}

//shoot bullet event
function shootBullet(shooter, target, inaccurate) {
    if (!shooter.fire) {
        var velocity;
        //shoot inaccurately
        if (inaccurate) {
            //accuracy base on this number, the larger number the lower accuracy
            var accu = blockSize * 4;
            var accurX;
            var accurY = shooter.p.y + ((accu) - (Math.random() * accu * 2));
            if (Math.abs(target.x - shooter.p.x) > blockCanvas.width / 2) {
                var mx = (shooter.p.x > target.x) ? shooter.p.x - blockCanvas.width : shooter.p.x + blockCanvas.width;
                accurX = mx + ((accu) - (Math.random() * accu * 2));
            } else {
                accurX = shooter.p.x + ((accu) - (Math.random() * accu * 2));
            }
            var newp = {x: accurX, y: accurY};
            velocity = getVelocity(newp, target, shooter.weapon.speed);
        } else {
            //use getVelocity() from func.js to get velocity between shooter and target point
            velocity = getVelocity(shooter.p, target, shooter.weapon.speed);
        }
        //create a bullet from shooter position and use shooter's bullet property
        var bullet = new Bullet(shooter.p, velocity, shooter.weapon, shooter.type);
        //add bullet into the list
        bulletList.push(bullet);
        shooter.setCD();
        //decrease energy if shooter is player
        if (shooter === player) {
            energy -= shooter.weapon.consume;
        }
    }
}

//player place object event
function placeObject() {
    //access click block function with callback function
    clickBlock(function (mapBlock, x, y) {
        //add static block object to the block if it is empty 
        if (mapBlock.stObj === null && mapBlock.objs.indexOf(player) < 0) {
            var obj = new Obj({x: x * blockSize, y: y * blockSize}, blockSize, blockhp * 2, 'rgba(0,255,255,0.1)');
            mapBlock.stObj = obj;
            renderBlock(obj, 'rgba(0,255,255,0.2)');
            energy -= 2;
        }
    }
    , function (x, y) {
        var p = {
            x: x * blockSize,
            y: y * blockSize
        };
        //if this block is empty create the block with the object added
        var obj = new Obj(p, blockSize, blockhp * 2, 'rgba(0,255,255,0.1)');
        blockMap[x][y] = new Block(obj, p);
        renderBlock(obj, 'rgba(0,255,255,0.2)');
        energy -= 2;
    });
}

function destroyObject() {
    //access click block function with callback function
    clickBlock(function (mapBlock, x, y) {
        //destroy static object if there is any
        if (mapBlock.stObj !== null) {
            mapBlock.stObj.hp -= digpower;
            if (mapBlock.stObj.hp <= 0) {
                clearBlock(mapBlock.stObj);
                mapBlock.stObj = null;
                //trigger player move event
                player.moved = true;
                //add loot if this block has loot
                if (mapBlock.background === 'loot') {
                    //pass block
                    addLoot(mapBlock);
                }
            }
        }
    });
}

//action when click a block
function clickBlock(success, fail) {
    //check click range
    var centerX = canvas.width / 2;
    var centerY = (canvas.height / 2) - blockSize / 2;
    //make sure clicking location is inside block range of player
    if (Math.abs(mouse.x - centerX) <= blockSize * 5.5 && Math.abs(mouse.y - centerY) <= blockSize * 5.5) {
        var mapmouse = mouse.mapXY();
        //get mosue x and y based on player location
        var x = indexConvert(mapmouse.x, mapSize.x);
        var y = indexConvert(mapmouse.y, mapSize.y);
        //get block
        var mapBlock = blockMap[x][y];
        //call success function if there is a block in this coordinate
        if (mapBlock !== undefined) {
            success(mapBlock, x, y);
        }
        //call fail function if fail is defined and there is not block in this coordinate
        else if (fail !== undefined) {
            fail(x, y);
        }
    }

}




/*----------------MOVEMENT COLLISION----------------*/

//player movement
function playerMove() {
    var newX, newY;
    //for player walk left or right
    if (player.left || player.right) {
        //create a new x position based on direction.
        newX = (player.left) ? player.p.x - player.speed : player.p.x + player.speed;
        //teleport player to other side if player walk out of the map
        if (newX >= blockCanvas.width) {
            newX -= blockCanvas.width;
        } else if (newX < 0) {
            newX += blockCanvas.width;
        }
        //if there is new barrier set player x position to new x position
        if (!barrier_LeftRight(player, newX, player.left)) {
            player.p.x = newX;
            //player moved
            player.moved = true;

        }
    }
    //update block player occupied
    if (player.moved) {
        updateOccupied(player, player.halfWidth, player.halfHeight);
    }

    //jump action
    if (player.up && player.jf > 0) {

        newY = player.p.y - player.speed;
        //check if there is a barrier on top
        if (!barrier_UpDown(player, newY - player.halfHeight, false)) {
            //player moved
            player.moved = true;
            //set new position
            player.p.y = newY;
            //decrease jump time              
        }
        player.jf--;
    }
    //test if player will fall if player is not jumping and has moved
    else if (player.moved) {
        //falling speed
        newY = player.p.y + player.speed;
        if (!barrier_UpDown(player, (newY + player.halfHeight), true)) {
            player.p.y = newY;

        } else {
            //reset jump
            player.recoverJump();
            player.moved = false;
            updateOccupied(player, player.halfWidth, player.halfHeight);
        }
    } else
        player.recoverJump();

}

//detect upper or lower barrier
function barrier_UpDown(obj, newY, land) {
    //upper and lower limit
    if (newY > blockCanvas.height * 0.9 || newY < blockCanvas.height * 0.1) {
        return true;
    }
    //index of min x coordinate
    var minxi = indexConvert(obj.p.x - obj.halfWidth + 1, mapSize.x);
    //index of max x coordinate
    var maxxi = indexConvert(obj.p.x + obj.halfWidth - 1, mapSize.x);
    //index of y coordinate
    var yi = indexConvert(newY, mapSize.y);
    //if left and right is inside same block
    if (minxi === maxxi) {
        //return true if block has a static object
        if (checkBlock(minxi, yi)) {
            if (testing)
                renderBlock(blockMap[minxi][yi].stObj, 'lightgreen');
            if (land) {
                //make sure player wont stuck into the block
                obj.p.y = ((yi * blockSize) - (obj.halfHeight) - blockSize / 2);
            } else {
                obj.p.y = ((yi * blockSize) + (obj.halfHeight) + blockSize / 2);
            }
            return true;
        }
    } else {
        //extreme case when minii is greater than maxxi when cross boundary
        if (minxi >= maxxi) {
            while (minxi !== maxxi + 1) {
                //     console.log(minxi+" "+maxxi);
                //return true if there is a barrier
                if (checkBlock(minxi, yi)) {
                    if (testing)
                        renderBlock(blockMap[minxi][yi].stObj, 'lightgreen');
                    if (land) {
                        //make sure player wont stuck into the block
                        obj.p.y = ((yi * blockSize) - (obj.halfHeight) - blockSize / 2);
                    } else {
                        obj.p.y = ((yi * blockSize) + (obj.halfHeight) + blockSize / 2);
                    }
                    return true;
                } else {
                    minxi++;
                    if (minxi >= mapSize.x) {
                        minxi = 0;
                    }
                }
            }
        } else {
            //travel from top to bottom to see if any body part collide with an object
            while (minxi <= maxxi) {
                //return true if there is a barrier
                if (checkBlock(minxi, yi)) {
                    if (testing)
                        renderBlock(blockMap[minxi][yi].stObj, 'lightgreen');
                    if (land) {
                        //make sure player wont stuck into the block
                        obj.p.y = ((yi * blockSize) - (obj.halfHeight) - blockSize / 2);
                    } else {
                        obj.p.y = ((yi * blockSize) + (obj.halfHeight) + blockSize / 2);
                    }
                    return true;
                } else {
                    minxi++;
                }
            }
        }
    }
    return false;
}

//check if block has static object
function checkBlock(x, y) {
    return blockMap[x][y] !== undefined && blockMap[x][y].stObj !== undefined && blockMap[x][y].stObj !== null;
}

//detect left or right barrier
function barrier_LeftRight(obj, newX, left) {
    //get map x index;
    var xi = indexConvert(((left) ? newX - obj.halfWidth : newX + obj.halfWidth), mapSize.x);
    //check if there is vertical blocks in this horizontal position 
    if (blockMap[xi] !== null && blockMap[xi] !== undefined) {
        //get obj's top y index
        var minyi = indexConvert((obj.p.y + 1 - obj.halfHeight), mapSize.y);
        //get obj's bottom y index
        var maxyi = indexConvert((obj.p.y - 1 + obj.halfHeight), mapSize.y);
        //if top and bottom is in same block
        if (minyi === maxyi) {
            //return true is there is no static object else return false     
            if (testing && blockMap[xi][minyi] !== undefined)
                renderBlock(blockMap[xi][minyi], 'lightgreen');
            if (checkBlock(xi, minyi)) {
                //adjust obj coordinate so it wont stuck into the block
                obj.p.x = ((xi * blockSize) + ((left) ? blockSize : -blockSize));
                updateOccupied(obj, obj.halfWidth, obj.halfHeight);
                return true;
            }
        } else {
            //travel from top to bottom to see if any body part collide with an object
            while (minyi <= maxyi) {
                //return true if there is a barrier
                if (checkBlock(xi, minyi)) {
                    if (testing)
                        renderBlock(blockMap[xi][minyi].stObj, 'lightgreen');
                    //adjust obj coordinate so it wont stuck into the block
                    obj.p.x = ((xi * blockSize) + ((left) ? blockSize : -blockSize));
                    updateOccupied(obj, obj.halfWidth, obj.halfHeight);
                    return true;
                }
                minyi++;
            }
        }
    }
    //return no barrier
    return false;
}

//update the block player occupied
function updateOccupied(obj, width, height) {
    var left = indexConvert((obj.p.x - width), mapSize.x);
    var right = indexConvert((obj.p.x - 1 + width), mapSize.x);
    var top = indexConvert(obj.p.y - height, mapSize.y);
    var bot = indexConvert((obj.p.y - 1 + height), mapSize.y);

    //get all block player occupied
    var newBlocks = [];

    //extreme case when crossing border
    if (left > right) {
        while (left !== right + 1) {
            var tempTop = top;
            while (tempTop <= bot) {
                if (blockMap[left][tempTop] === undefined) {
                    blockMap[left][tempTop] = new Block(null, {x: left * blockSize, y: tempTop * blockSize});
                }
                newBlocks.push(blockMap[left][tempTop]);
                tempTop++;
            }
            left++;
            if (left >= mapSize.x) {
                left = 0;
            }
        }
    } else {
        while (left <= right) {
            var tempTop = top;
            while (tempTop <= bot) {
                if (blockMap[left][tempTop] === undefined) {
                    blockMap[left][tempTop] = new Block(null, {x: left * blockSize, y: tempTop * blockSize});
                }
                newBlocks.push(blockMap[left][tempTop]);
                tempTop++;
            }
            left++;
        }
    }
    //update
    if (testing)
        obj.updateBlock(obj, newBlocks, renderBlock, clearBlock);
    else
        obj.updateBlock(obj, newBlocks);
}

/*-----------------ENEMY EVENT----------------*/

//generate enemy
function spawnEnemy() {
    if (enemyList.isEmpty() && wait) {
        wait = false;
        boss = false;
        setTimeout(function () {
            enemySpawnSize += 1 + (Math.round(Math.random() * 3));
            spawn = enemySpawnSize;
        }, 4000);
    }

    //spawn boss
    if (surviveTime > 1 && (surviveTime === 150 || surviveTime % 421 === 0) && !boss) {
        console.log('boss comming');
        boss = true;
        var p = {
            x: player.p.x,
            y: player.p.y - ((blockSize * 30))
        };
        var weapIndex = 2 + Math.round(Math.random() * 2);
        
        var enemy = new Entity(p, blockSize * 8, blockSize * 2, 1800, 30, 0, enemyWeapon[weapIndex], player, movementSpeed, 'eboss', '#0a4960');
        enemy.click = 200 * Math.random() + 300;
        enemy.jf = 1;
        enemyList.push(enemy);
    }

    if (surviveTime >= 5 && spawn > 0) {
        wait = true;
        var allowType2 = false;
        //spawn fly enemy when survive time is greater than 100 sec
        if (surviveTime >= 100) {
            allowType2 = true;
        }


        var p = {
            x: player.p.x + ((canvas.width) - (Math.random() * canvas.width * 2)),
            y: player.p.y - ((blockSize * 4) + blockSize * Math.random() * 20)
        };
        var type;
        var weapon;
        var width;
        var height;
        var hp;
        //use as block range
        var range = blockSize * ((Math.random() * 15) + 10);
        var speed = movementSpeed * (0.5 + Math.random() * 0.6);

        if (randBoolean() && allowType2) {

            type = 'enemy2';
            weapon = enemyWeapon[1];
            width = blockSize;
            height = blockSize;
            hp = 20;

        } else {
            type = 'enemy1';
            weapon = enemyWeapon[0];
            width = blockSize;
            height = blockSize * 2;
            hp = 25;
        }

        var enemy = new Entity(p, width, height, hp, range, 0, weapon, player, speed, type);
        enemy.click = 200 * Math.random() + 300;
        enemy.jf = 1;
        enemyList.push(enemy);

        spawn--;
    }
}


//move enemy move and shoot
function enemyMove() {
    if (!enemyList.isEmpty()) {
        enemyList.forEach(function (node) {
            var enemy = node.val;
            switch (enemy.type) {
                case 'enemy1':
                    //move type 1 enemy
                    move_type1(enemy);
                    break;
                case 'enemy2' :
                case 'eboss':
                    //move type 1 enemy
                    move_type2(enemy);
            }

            //make enemy shoot bullet or stop shooting randomly
            if (enemy.click <= (50 + Math.random() * 100)) {
                if (enemy.type !== 'enemy1') {
                    shootBullet(enemy, player.p, true);
                } else if (enemy.down) {
                    shootBullet(enemy, player.p, true);
                }

            } else if (enemy.click >= (400 + Math.random() * 400)) {
                enemy.click = 0;
                if (enemy.type === 'eboss') {
                    enemy.weapon = enemyWeapon[2 + Math.round(Math.random() * 2)];
                }
            }
            enemy.click++;

        });
    }
    ;
}


//enemy type 1 move event, dp for jump and only detect collision when up and down is true
function move_type1(enemy) {
    //update range, use jf as updateRange timer, initJF as range, 
    if (enemy.jf % 100 === 0) {
        enemy.initJF = blockSize * ((Math.random() * 20) + 10);
    }
    enemy.jf++;

    enemy.left = enemy.p.x > player.p.x;
    var range = Math.abs(player.p.x - enemy.p.x);
    var boundary = range > blockCanvas.width / 2;
    //moving toward target
    if (boundary) {
        range = Math.abs(range - blockCanvas.width);
        //reverse if reverse path is shorter
        enemy.left = !enemy.left;
    }
    //move toward target when range is outside of initjf
    if (range >= enemy.initJF) {
        enemy.up = true;
    }
    //moving away from target if it is 90% inside
    else if (range <= enemy.initJF * 0.9) {
        enemy.left = !enemy.left;
        enemy.up = true;
    } else
        enemy.up = false;


    //check left and right collision only when needed
    if (enemy.up && enemy.down) {
        var newX;
        if (enemy.left) {
            newX = enemy.p.x - enemy.speed / 2;
        } else {
            newX = enemy.p.x + enemy.speed / 2;
        }
        if (newX >= blockCanvas.width) {
            newX -= blockCanvas.width;
        } else if (newX < 0) {
            newX += blockCanvas.width;
        }
        //if there is new barrier set enemy x position to new x position
        if (!barrier_LeftRight(enemy, newX, enemy.left)) {
            enemy.moved = true;
            enemy.p.x = newX;
        } else {
            enemy.dp = 20;
        }
    }


    var newY;
    //jump action
    if (enemy.dp > 0) {
        newY = enemy.p.y - enemy.speed;
        //check if there is a barrier on top
        if (!barrier_UpDown(enemy, newY - enemy.halfHeight, false)) {
            //enemy moved
            enemy.moved = true;
            //set new position
            enemy.p.y = newY;
        } else {
            //shoot top block
            shootBullet(enemy, {x: enemy.p.x, y: enemy.p.y - 10});
        }
        enemy.dp--;
    }
    //test if enemy will fall if enemy is not jumping and has moved
    else if (enemy.moved) {
        //falling speed
        newY = enemy.p.y + enemy.speed;
        if (!barrier_UpDown(enemy, (newY + enemy.halfHeight), true)) {
            enemy.p.y = newY;

        } else {
            //stop jump
            enemy.dp = 0;
            enemy.moved = false;
            updateOccupied(enemy, enemy.halfWidth, enemy.halfHeight);
            //enemy is deployed on ground
            enemy.down = true;
        }
    } else
        enemy.dp = 0;

    //update block enemy occupied
    if (enemy.moved) {
        // modifyBoundary(enemy);
        updateOccupied(enemy, enemy.halfWidth, enemy.halfHeight);
    }
}

function move_type2(enemy) {
    //update range, use jf as updateRange timer, initJF as range, 
    if (enemy.jf % 100 === 0) {
        enemy.initJF = blockSize * ((Math.random() * 20) + 10);
    }
    enemy.jf++;


    var range = Math.abs(player.p.x - enemy.p.x);

    if (range > enemy.initJF) {


        enemy.left = enemy.p.x > player.p.x;
    }


    var boundary = range > blockCanvas.width / 2;
    //moving toward target
    if (boundary) {
        range = Math.abs(range - blockCanvas.width);
        //reverse if reverse path is shorter
        enemy.left = !enemy.left;
    }
    //move toward target when range is outside of initjf
    //if (range >= enemy.initJF) {
    //      enemy.move = true;
    // }
    //moving away from target if it is 90% inside


    var heightrange = player.p.y - (blockSize * 5) - enemy.p.y;
    //    console.log(heightrange);
    if (heightrange < 0) {
        enemy.up = true;
    } else if (heightrange <= enemy.initJF) {
        if (enemy.initJF === 0) {
            enemy.up = randBoolean();
        }
    } else {
        enemy.up = false;
    }



    //check left and right collision only when needed
    // if (enemy.moved) {

    var newX = (enemy.left) ? enemy.p.x - enemy.speed : enemy.p.x + enemy.speed;
    if (newX >= blockCanvas.width) {
        newX -= blockCanvas.width;
    } else if (newX < 0) {
        newX += blockCanvas.width;
    }
    //if there is new barrier set enemy x position to new x position
    if (enemy.type === 'eboss' || !barrier_LeftRight(enemy, newX, enemy.left)) {
        enemy.p.x = newX;
    }


    //jump action
    newY = (enemy.up) ? enemy.p.y - enemy.speed : enemy.p.y + enemy.speed;
    //check if there is a barrier on top
    if (enemy.type === 'eboss' || !barrier_UpDown(enemy, (enemy.up) ? newY - enemy.halfHeight : newY + enemy.halfHeight, !enemy.up)) {
        //set new position
        enemy.p.y = newY;
    }
    updateOccupied(enemy, enemy.halfWidth, enemy.halfHeight);
    // }


}

/*----------------OBJECT EVENT----------------*/

function bulletMove() {
    if (!bulletList.isEmpty()) {
        bulletList.forEach(function (node) {
            var bullet = node.val;
            //draw bullet
            renderBullet(bullet);
            //get collided block array
            var blockArr = bullet.getCollideBlock();
            //do this if there is more than one collided block
            blockArr.forEach(function (block) {
                //if it is a block
                if (block.stObj !== undefined && block.stObj !== null) {
                    bulletAndObj(block, bullet);
                }
                //else it is a entity
                else {
                    bulletAndEntity(block, bullet);
                }
            });

            if (bullet.hp > 0 && bullet.travelRange > 0) {
                //move bullet if travel range and hp is greater than 0
                bullet.move(blockCanvas);
                updateOccupied(bullet, bullet.radius, bullet.radius);
            } else {
                //remove this node if the bullet hp is 0 or collide with a block
                bulletList.remove(node);
                bullet.destroy(bullet, clearBlock);
            }
        });
    }
}

//when bullet collide with stobj
function bulletAndObj(block, bullet) {
    //reduce block hp
    block.stObj.hp -= bullet.property.dmg;
    if (testing) {
        block.stObj.color = 'lightgrey';
        renderBlock(block, block.stObj.color);
    }
    //clear block if block hp is 0 or less
    if (block.stObj.hp <= 0) {
        block.stObj = null;
        clearBlock(block);
        //add loot if there loot inside this block
        if (block.background === 'loot') {
            addLoot(block);
        }
        player.moved = true;
    }
    //decrease bullet hp
    bullet.hp--;
}

//when bullet collide with entity
function bulletAndEntity(block, bullet) {
    for (var i = 0; i < block.objs.length; i++) {
        var obj = block.objs[i];
        //make sure it is not the shooter of the bullet
        if (obj.type.charAt(0) !== bullet.owner.charAt(0) && testCollide(obj, bullet)) {
            var isPlayer = obj === player;
            //if energy shield active, obj is a player, and has over 200 energy.      
            if (isPlayer && energyShield && energy >= 300) {
                //reduce energy instead of hp, but consume double dmg
                energy -= bullet.property.dmg * 4;
                if (energy <= 300) {
                    energyShield = false;
                    $('#player').removeClass('playerShield');
                }
            } else {
                obj.hp -= bullet.property.dmg;
            }
            generateBlood(bullet.p);
            //destory obj if its hp is 0 or less and the object is a enemy
            if (obj.hp <= 0 && !isPlayer) {
                enemyList.removeByValue(obj);
                if (testing) {
                    obj.destroy(obj, clearBlock);
                } else
                    obj.destroy(obj);
                //add score
                score += 10;
                //loot amout
                var lootV = 25 + Math.round(Math.random() * 55);
                //bonus for defeating boss
                if (obj.type === 'eboss') {
                    lootV = 500;
                    score += 90;
                    player.hp += 150;
                }
                //drop loot
                addLoot(obj, lootV);
            }
            //decrease bullet hp
            bullet.hp--;

        }
    }
}

//test collision
function testCollide(obj, bullet) {
    //ballSize * (p1.radius) + ballSize * (p2.radius) - findDist(p1, p2) >= 0;
    var insideY = (obj.halfHeight + bullet.radius) - Math.abs(bullet.p.y - (obj.p.y)) >= 0;
    return insideY;

}

//add loot
function addLoot(block, lootAmount) {
    //random loot amount from 10-90 if amout is undefined
    if (lootAmount === undefined) {
        lootAmount = Math.round(10 + Math.random() * 30);
    }
    //loot size based on loot amount
    var lootSize = (lootAmount / 60) * blockSize;
    //push loot inside list
    lootList.push(new Obj(block.p, lootSize, lootAmount));
    //clear this block's loot
    block.background = null;
}

//move loot
function lootMove() {
    if (!lootList.isEmpty()) {
        lootList.forEach(function (node) {
            var loot = node.val;
            //get blocks this loot occupied
            var blockArr = loot.blocks;
            //check if player is within the range
            for (var i = 0; i < blockArr.length; ++i) {
                var block = blockArr[i];
                //increase pending energy and destroy self if player is within the range
                if (block.objs.indexOf(player) !== -1) {
                    energy += loot.hp;
                    lootList.remove(node);
                    loot.destroy(loot, clearBlock);
                    return;
                }
            }

            var velocity = getVelocity(loot.p, player.p, movementSpeed * 2);

            //extreme case during boundary
            if (Math.abs(player.p.x - loot.p.x) > blockCanvas.width / 2) {
                loot.p.x -= velocity.x;
            } else {
                loot.p.x += velocity.x;
            }
            modifyBoundary(loot);
            loot.p.y += velocity.y;
            updateOccupied(loot, loot.radius, loot.radius);
        });
    }
}

function modifyBoundary(obj) {
    if (obj.p.x >= blockCanvas.width) {
        obj.p.x -= blockCanvas.width;
    } else if (obj.p.x < 0) {
        obj.p.x += blockCanvas.width;
    }
}

function bloodMove() {
    if (!bloodList.isEmpty()) {
        bloodList.forEach(function (node) {
            var bld = node.val;
            if (bld.hp < 0) {
                bloodList.remove(node);
                bld.destroy(bld, clearBlock);
            } else {
                bld.p.x += bld.v.x;
                bld.p.y += bld.v.y;
                bld.hp -= 0.03;
            }
        });
    }
}

function generateBlood(p) {
    var num = 2 + Math.random() * 5;
    for (var i = 0; i < num; i++) {
        var size = 3 + Math.random() * (blockSize / 4);
        var v = {
            x: (2 - Math.random() * 4),
            y: (2 - Math.random() * 4)
        };
        //p, diameter, hp, color
        var blood = new Obj(p, size, 1);
        blood.v = v;
        bloodList.push(blood);
    }
}


/* ----------------CANVAS-DRAW FUNCTION---------------- */

//generate new block canvas
function newBlockCanvas() {
    blockCanvas = document.createElement('canvas');
    blockCanvas.width = blockSize * mapSize.x;
    blockCanvas.height = blockSize * mapSize.y;
    blockCtx = blockCanvas.getContext("2d");
    blockCtx.clearRect(0, 0, blockCanvas.width, blockCanvas.height);
}


//render block
function renderBlock(obj, c) {
    blockCtx.beginPath();
    blockCtx.fillStyle = c;
    blockCtx.fillRect(obj.p.x, obj.p.y, blockSize, blockSize);
}

//clear block
function clearBlock(obj) {
    if (obj.stObj === null || obj.stObj === undefined) {
        blockCtx.beginPath();
        blockCtx.clearRect(obj.p.x, obj.p.y, blockSize, blockSize);
    } else {
        renderBlock(obj, obj.stObj.color);
    }
}

//render bullet
function renderBullet(bullet) {
    ctx.beginPath();
    ctx.fillStyle = bullet.color;
    var p = getXYRatio(bullet.p);
    ctx.arc(p.x, p.y, bullet.radius, 0, Math.PI * 2, false);
    ctx.fill();
}

//get x and y range based on player position
function getXYRatio(p) {
    var p2 = {x: null, y: null};
    if (Math.abs(p.x - player.p.x) > blockCanvas.width / 2) {
        if (p.x > player.p.x) {
            p2.x = p.x - blockCanvas.width - (player.p.x) + canvas.width / 2;
        } else {
            p2.x = (blockCanvas.width + p.x) - (player.p.x) + canvas.width / 2;
        }
    } else {
        p2.x = p.x - (player.p.x) + canvas.width / 2;
    }
    p2.y = p.y - (player.p.y + blockSize / 2) + canvas.height / 2;
    return p2;
}


//draw canvas
function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas


    //draw blood list if not empty
    if (!bloodList.isEmpty()) {
        bloodList.forEach(function (node) {
            var bld = node.val;
            ctx.beginPath();
            ctx.fillStyle = "rgba(0, 255, 255," + bld.hp + ")";
            var p = getXYRatio(bld.p);
            ctx.arc(p.x, p.y, bld.radius, 0, Math.PI * 2, false);
            ctx.fill();
        });
    }

    drawBlockCanvas();

    //draw loot if not empty
    if (!lootList.isEmpty()) {
        lootList.forEach(function (node) {
            var loot = node.val;
            ctx.beginPath();
            ctx.fillStyle = 'rgba(0,255,255,' + Math.random() + ')';
            var p = getXYRatio(loot.p);
            ctx.arc(p.x, p.y, loot.radius, 0, Math.PI * 2, false);
            ctx.fill();
        });
    }

    if (boss) {
        ctx.fillStyle = '#0a4960';
    } else {
        ctx.fillStyle = 'white';
    }
    //draw loot if not empty
    if (!enemyList.isEmpty()) {
        enemyList.forEach(function (node) {
            var enemy = node.val;
            var p = getXYRatio({x: enemy.p.x - enemy.halfWidth, y: enemy.p.y - enemy.halfHeight});
            ctx.fillRect(p.x, p.y, enemy.width, enemy.height);
        });
    }

    ctx.fillStyle = 'white';
    ctx.font = "20px Comic Sans MS";
    ctx.textAlign = "start";
    ctx.fillText("FPS: " + Math.round(fps), 10, canvas.height - 25);

    ctx.textAlign = 'center';

    ctx.fillText("Coordinate: (" + player.p.x.toFixed(0) + "," + player.p.y.toFixed(0) + ")", canvas.width / 2, canvas.height - 50);


    var textX = canvas.width - 20;


    ctx.textAlign = "end";
    ctx.fillStyle = flyCanvasColor;
    var jf = player.jf * (canvas.height / player.initJF);
    ctx.fillRect(canvas.width - 10, canvas.height - jf, 20, jf);


    ctx.fillStyle = bldCanvasColor;
    ctx.fillRect(canvas.width - player.hp * 2, 0, player.hp * 2, 30);

    var eg = energy / 2;
    ctx.fillStyle = energyCanvasColor;
    ctx.fillRect(canvas.width - eg, 30, eg, 30);


    ctx.fillStyle = 'white';
    ctx.fillText("HP: " + player.hp, textX, 20);
    if (energyShield) {
        ctx.fillText("Energy (Shield): " + energy, textX, 50);
    } else {
        ctx.fillText("Energy: " + energy, textX, 50);
    }
    ctx.fillText("Jump Fuel: " + player.jf, textX, canvas.height - 25);

    ctx.font = "25px  Comic Sans MS";

    ctx.fillText("Score: " + score, textX, 100);
    ctx.fillText("Survive: " + surviveTime, textX, 130);
    ctx.fillText("Enemies: " + enemyList.size, textX, 160);
}






//draw sub image from block canvas
function drawBlockCanvas() {
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;

    var sx = player.p.x + (player.halfWidth) - centerX;
    var sy = player.p.y + (player.halfHeight) - centerY;

    //connect ending point of block map to the starting point of the map when player come to end boundary.
    if (sx + canvas.width > blockCanvas.width) {
        var vp = sx + canvas.width;
        var w2 = vp - blockCanvas.width;
        var w1 = canvas.width - w2;

        ctx.drawImage(blockCanvas, sx, sy, w1, canvas.height, 0, 0, w1, canvas.height);
        ctx.drawImage(blockCanvas, 0, sy, w2, canvas.height, w1, 0, w2, canvas.height);
    }
    //connect starting point of block map to the ending point of the map when player is over the starting boundary.
    else if (sx < 0) {
        var w2 = sx * -1;
        var w1 = canvas.width - w2;
        ctx.drawImage(blockCanvas, 0, sy, w1, canvas.height, w2, 0, w1, canvas.height);
        ctx.drawImage(blockCanvas, blockCanvas.width - w2, sy, w2, canvas.height, 0, 0, w2, canvas.height);
    } else {
        ctx.drawImage(blockCanvas, sx, sy, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    }
}

