
var imageLoader = Class.create({

    initialize: function() {
		this.images = [];
		this.callback = null;
		this.loadCount = 0;
    },

	_onLoad: function() {
		this.loadCount--;
		if(this.loadCount == 0 && this.callback != null) {
			this.callback();
			this.callback=null;
		}
	},
	
	onLoad: function(callback) {
		this.callback = callback;
	},

	load: function(arrayOfImages) {
		this.loadCount = arrayOfImages.length;
		for(var i=0; i<arrayOfImages.length; i++) {
			var img = new Image();
	    	img.src = arrayOfImages[i];
	    	img.onload = this._onLoad();
			this.images.push(img);
		}
	},
	
	get: function() {
		return this.images;
	}

});