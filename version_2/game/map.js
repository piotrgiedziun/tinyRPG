/***
 * 	Map class
 *
 *  draw, create, manage maps
 */
var Map = Class.extend({
	init: function(context) {
		this.context = context;
		this.collisions  = null;
		this.background = null;
		this.object = null;
		this.pos = null;
		this.x = 360;
		this.y = 100;
		this.moveSpeed = 5;
		this.player = null;
	},

	draw: function() {
		//console.log("draw map");
		this._drawLayer(this.background);
		this._drawLayer(this.object);
	},

	tick: function(input, player) {
		if(input[ARROWS.LEFT]) {
			this.x += this.moveSpeed;
		}else if(input[ARROWS.RIGHT]) {
			this.x -= this.moveSpeed;
		}

		if(input[ARROWS.UP]) {
			this.y += this.moveSpeed;
		}else if(input[ARROWS.DOWN]) {
			this.y -= this.moveSpeed;
		}
		this.context.beginPath();
		this.context.clearRect(0, 0, 896, 580);

		this.player = player;

		this.draw();
	},

	_drawLayer: function(layerData) {
		var tileH = 32;

		for(var i=0;i<layerData.length;i++){
			for(var j=0;j<layerData[i].length;j++){

				if( layerData[j][i] == 0) continue;
				var pos = this.pos[layerData[j][i]-1];
				var dX = (i-j)*tileH + this.x;
				var dY = (i+j)*tileH/2 + this.y;

				this.context.drawImage(this.image, pos.x, pos.y, pos.w, pos.h, dX, dY-pos.h, pos.w, pos.h);

				if(this.player.i == i &&  this.player.j == j) {
					//draw player
					this.player.draw(dX, dY);
				}
			}
		}
	},

	loadMap: function(id, callback) {
		var inst = this;
		var itemToLoad = 2;
		var onload = function() {
			if (--itemToLoad == 0) {
				callback();
			}
		};

		//get map data
		$.getJSON("map/"+id+".json", function(d) {
			inst.collisions  = d.collisions;
			inst.background = d.background;
			inst.object = d.object;
			inst.pos = d.positionMaper;
			onload();
		});

		//get map image
		this.image = new Image();
		this.image.src = "map/"+id+".png";
		this.image.onload = onload;
	}
});