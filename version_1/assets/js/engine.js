var KEYCODE_ENTER = 13;

var PLAYER_SPRITE_START_POSITION = 48;
var SITE_URL = "127.0.0.1:8888";

var canvas;
var mapCanvas;
var stage;
var img;
var character;
var players = {};
var fpsLabel, nameLabel;
var log;
var websocket;
var playerSpriteSheet;
var map;
var playerSprites;
var screen_start_x = 0;
var screen_start_y = 0;

function init() {
	//load sprites
	playerSprites = new imageLoader();
	playerSprites.onLoad(function() {
		console.log("images loaded");
		console.log("connecting...");
		connect();
	});
	playerSprites.load(["assets/img/character_1.png", "assets/img/character_2.png", "assets/img/character_3.png"]);
	
    map = new Map();
	map.id = 2;
	map.underBitmap = document.getElementById("mapUnderCanvas").getContext('2d');
	map.aboveBitmap = document.getElementById("mapAboveCanvas").getContext('2d');
    canvas = document.getElementById("testCanvas");
	topCanvas = document.getElementById("mapAboveCanvas");
    stage = new Stage(canvas);

	if (Touch.isSupported()) { Touch.enable(stage); }
	stage.enableMouseOver(30);

}

function create_game(r) {
	//read r
	character = new Player(r.id, r.name, r.x, r.y, true);

    topCanvas.onclick = function(e) {
        e = e || window.event;
        var pos = getPos(this),
        x =  Math.floor( (e.pageX - pos.x)/32 ),
        y = Math.floor( (e.pageY - pos.y)/32 );

        character.goTo(map.findPath(character.x, character.y, x, y));
    };

	//since we know map id
	map.loadMap("http://"+SITE_URL+"/map/"+map.id, draw_map);
	
	// create spritesheet and assign the associated data.
    playerSpriteSheet  = new SpriteSheet({
        images: playerSprites.get(),
        frames: {width:32, height:32, regX:0, regY:0},
        animations: {
            walkD: [0,2],
            walkL: [3,5],
            walkR: [6,8],
            walkU: [9,11],
            stopD: [0],
            stopL: [3],
            stopR: [6],
            stopU: [10]
        }
    });
    create_player();

    fpsLabel = new Text("-- fps","bold 18px Arial","#FFF");
    stage.addChild(fpsLabel);
    fpsLabel.x = 10;
    fpsLabel.y = 20;

    nameLabel = new Text("","bold 12px Arial","#FFF");
    stage.addChild(nameLabel);
    nameLabel.x = -1;
    nameLabel.y = -1;

    Ticker.addListener(window);
	ready();
}

function ready() {
    //send update
	log.innerHTML += ("WEBSOCKET: ready<br/>");
    var string = Object.toJSON({
            type: "ready"
    });
    websocket.send(string);
}

function connect() {
    log = document.getElementById("log");
    log.innerHTML = "> WEBSOCKET: Connecting to ws://"+SITE_URL+"/socket<br/>";

    websocket = new WebSocket("ws://"+SITE_URL+"/socket");

    websocket.onopen = function() {
        log.innerHTML += ("WEBSOCKET: Connected<br/>");
	};
	
    websocket.onmessage = function (e) {
        var r = e.data.evalJSON();

        if(r.type == "updatePlayer" || r.type == "initPlayer") {
            if(players[r.id] == undefined) {
                log.innerHTML += ("init new player<br/>");
                console.log("init new player");

                players[r.id] = new Player(
                    r.id,
                    r.name,
                    r.x,
                    r.y
                );

                players[r.id].bitmap = new BitmapAnimation(playerSpriteSheet);
                players[r.id].bitmap.gotoAndPlay("stopR");

				(function(target) {
				target.bitmap.onMouseOver = function() {
					target.showName();
				}
				target.bitmap.onMouseOut = function() {
					target.hideName();
				}
				})(players[r.id]);

                players[r.id].bitmap.name = "Player";
                players[r.id]._setPos(r.x, r.y, true);
                players[r.id]._setPath(r.direction);

                stage.addChild(players[r.id].bitmap);
            }else{
                players[r.id]._setPos(r.x, r.y, r.x!=players[r.id].x || r.y!=players[r.id].y);
                players[r.id]._setPath(r.direction);
            }
            //draw_players();
        }else if(r.type == "message") {
            log.innerHTML += (r.author+": "+r.text+"<br/>");
        }else if(r.type == "removePlayer") {
            stage.removeChild(players[r.id].bitmap);
			 delete players[r.id];
        }else if(r.type == "aboutPlayer") {
	 		log.innerHTML += ("WEBSOCKET: aboutPlayer data recived<br/>");
			create_game(r)
		}
    };
	websocket.onerror = function(evt) {
		log.innerHTML += ("WEBSOCKET: Error "+evt.data+"<br/>");
	};
    websocket.onclose = function() {
        log.innerHTML += ("WEBSOCKET: Closed<br/>");
    };
}

function draw_map() {
    map.image = new Image();
    map.image.src = "assets/maps/map_"+map.id+".png";
    map.image.onload = function() {
		//count elements per line
		var epl = map.image.width/32;
		var el;
		//under
		for(var l=0; l<map.getElementUnderId(0,0).length; l++) {
        	for(var y=0; y<map.height; y++) {
            	for(var x=0; x<map.width; x++) {
					el = map.getElementUnderId(x, y, l);
					if (el == 0) continue;
					el--;
					map.underBitmap.drawImage(this, (el % epl)*32, Math.floor(el / epl)*32, 32, 32, x*32, y*32, 32, 32);
            	}
        	}
		}
		//above
		for(var l=0; l<map.getElementAboveId(0,0).length; l++) {
        	for(var y=0; y<18; y++) {
            	for(var x=0; x<28; x++) {
					el = map.getElementAboveId(x, y, l);
					if (el == 0) continue;
					el--;
					map.aboveBitmap.drawImage(this, (el % epl)*32, Math.floor(el / epl)*32, 32, 32, x*32, y*32, 32, 32);
            	}
        	}
		}

    };
}

function redraw_map() {

}

function update_position(x, y, direction) {
    //send update
    var string = Object.toJSON({
            type: "player",
            x: x,
            y: y,
            direction: direction
    });
    websocket.send(string);

	//
	redraw_map();
}

function create_player() {
    //draw player
    character.bitmap = new BitmapAnimation(playerSpriteSheet);
    character.bitmap.gotoAndPlay("stopR");

    character.bitmap.x = character.x*32;
    character.bitmap.y = character.y*32;

    stage.addChild(character.bitmap);
}

function message() {
    var entery = document.getElementById("entery");

    if(entery.value != "") {
        log.innerHTML += (character.name+": "+entery.value+"<br/>");
        websocket.send(Object.toJSON({
            type: "message",
            message: entery.value
        }));
    }

    entery.value = "";
    document.getElementById("entery").focus();
    document.getElementById("entery").blur();
}

function tick() {
    character.draw();

    for(var player_id in players) {
        players[player_id].draw();
    }

    fpsLabel.text = Math.round(Ticker.getMeasuredFPS())+" fps";

    stage.update();
}

document.onkeydown = function(e) {
       if(!e){ var e = window.event; }
       switch(e.keyCode) {
        case KEYCODE_ENTER:
            document.getElementById("entery").focus();
    }
};



function request_full_screen() {
    var elem = document.getElementById("canvasHolder");
    elem.onwebkitfullscreenchange = function () {

    };
    elem.webkitRequestFullScreen();
}
