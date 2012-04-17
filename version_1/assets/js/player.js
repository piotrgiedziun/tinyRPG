
var Player = Class.create( {

    initialize: function(id, name, x, y, mainCharacter) {
		this.main = mainCharacter;
        this.id=id;
        this.name=name;
        this.x=x;
        this.y=y;
        this.visible = false;
        this.path = undefined;
        this.isMoving = false;
        this.direction = "stopU";
        this.speed = 4;
		this.isNameShowed = false;
    },

	showName: function() {
		this.isNameShowed = true;
	},
	
	hideName: function() {
		nameLabel.text = "t";
		nameLabel.x = -1;
		nameLabel.y = -1;
		this.isNameShowed = false;
	},

    goTo: function(path) {
        this.path = path;;
        this._move();
    },

    _setPath: function(direction) {
        this.path = [direction];
        console.log(this.path);
        this._move();
    },

    _setPos: function(x, y, updateBitmap) {
        this.x = x;
        this.y = y;

        if(updateBitmap == true) {
            console.log("Player:: updateBitmap pos");
            this.bitmap.x = x*32;
            this.bitmap.y = y*32;
            //preven moving
            this.len = 0;
        }
    },

    _move: function() {
        if(this.isMoving || this.path == undefined || this.path.length == 0) return;
        this.direction = this.path.shift();
        this.isMoving = true;

        this.bitmap.vX = 0;
        this.bitmap.vY = 0;
        this.vX = 0;
        this.vY = 0;

        switch(this.direction) {
            case "L":
                console.log("move l");
                this.vX += -1;
                break;
            case "R":
                console.log("move r");
                this.vX += 1;
                break;
            case "U":
                console.log("move t");
                this.vY += -1;
                break;
            case "D":
                console.log("move b");
                this.vY += 1;
                break;
        }

        //send information
        if(this.main == true)
            update_position(this.x, this.y, this.direction);

        this.x += this.vX;
        this.y += this.vY;
        this.len = 32;
        this.bitmap.gotoAndPlay("walk"+this.direction);
    },

    draw: function() {
		if(this.isNameShowed) {
			nameLabel.text = this.name;
			nameLabel.x = this.bitmap.x;
			nameLabel.y = this.bitmap.y-15;
		}
        //check if there is movement action
        if(this.isMoving) {

            var tik_length = this.len-this.speed < 0 ? this.len : this.speed;
            //move
            this.bitmap.x += this.vX*this.speed;
            this.bitmap.y += this.vY*this.speed;
            this.len -= tik_length;

            if(this.len <= 0) {
                //stop
                this.bitmap.gotoAndPlay("stop"+this.direction);

                //fix pos
                this.bitmap.x = this.x*32;
                this.bitmap.y = this.y*32;

                this.isMoving = false;
                this._move();
            }
        }else{
            //look for movement action
            this._move();
        }
    }
});