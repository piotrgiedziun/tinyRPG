/***
 * 	Player class
 *
 *  draw, create, manage players
 */
var Player = Class.extend({
	init: function(context) {
		this.context = context;
		this.i = 10;
		this.j = 7;
		this.x = 0;
		this.y = 0;
		this.moveSpeed = 1;
	},

	loadPlayer: function(callback) {
		this.image = new Image();
		this.image.src = "http://glacialflame.com/tutorials/tiles/06/ralph.png";
		this.image.onload = callback;
	},

	draw: function(x, y) {
		console.log(x+","+y);

		this.x = this.i*32;
		this.y = this.j*32;
		console.log(this.x+","+this.y);
		this.context.drawImage(this.image, 0, 0, 50, 50, this.x, this.y, 50, 50);
	},

	tick: function(input) {
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
	}
});