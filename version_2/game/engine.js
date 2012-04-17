/***
 * 	Engine class
 *
 *  This class is main container.
 */
var ARROWS = {
	UP: 38,
	DOWN: 40,
	LEFT: 37,
	RIGHT: 39,
	W: 87,
	S: 83,
	A: 65,
	D: 68
};

var Engine = Class.extend({
	init: function() {
		this.timer = null;

		this.input = {};
		for(var index in ARROWS)
			this.input[ARROWS[index]] = false;

		this.FPS = 35;

		this.map = null;
		this.player = null;
		this.canvas = document.getElementById('mapUnderCanvas');
		this.context = this.canvas.getContext('2d');
	},

	start: function() {
		var inst = this;

		this.drawTitle("Loading...");

		// load required classes
		this.loadClass(["map", "player"], function() {
			inst.map = new Map(inst.context);
			inst.map.loadMap(1, function() {
				//init player
				inst.player = new Player(inst.context);
				inst.player.loadPlayer(function() {
					//start clock
					inst.runClock();
				});
			});
		});

		//set hook
		$(document).keydown(function(e) {
			inst.input[e.keyCode] = true;
			console.log("key down " + e.keyCode)
		});

		$(document).keyup(function(e) {
			inst.input[e.keyCode] = false;
			console.log("key up " + e.keyCode)
		});

	},

	runClock: function() {
		var inst = this;
		this.timer = setTimeout(function() {
			inst.tick();
		}, 1000/inst.FPS);
	},

	drawTitle: function(text) {
		//stop timer
		this.timer = null;
		this.context.beginPath();
		this.context.clearRect(0, 0, 896, 580);
		this.context.font = "40pt Calibri";
		this.context.fillStyle = "white";
		this.context.textAlign = "center";
		this.context.textBaseline = "middle";
		this.context.fillText(text, 896/2, 580/2);
	},

	tick: function() {
		//stop timer
		if(this.timer == null) return;
		this.player.tick(this.input);
		this.map.tick(this.input, this.player);
		this.runClock();
	},

	/*
		Load scripts

		Parms:
		* files - name/s of file/s to load (string or array)
		* callback - function to call when scripts will be loaded

		Usage:
		* this.loadClass(["script1", "script2"], callback);
		* this.loadClass("script", callback);

	 	Throw:
	 	* error (code: 100) - when script filed to load

	 */
	loadClass: function(files, callback) {
		if(!$.isArray(files)) {
			files = [files];
		}
		//for each load script
		$.each(files, function(index, file) {

			$.getScript("game/"+file+".js")
				.done(function() {

					//remove item form queue
					files = $.grep(files, function(value) {
						return value != file;
					});

					//call callback when all works is done
					if(files.length == 0 && callback instanceof Function)
						callback();
				})
				.fail(function() {
					//report error
					throw new Error("error while loading script "+file, 100);
				});
		});
	}
});
