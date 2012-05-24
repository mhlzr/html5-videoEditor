window.Capabilities = (function(window, document){
	
	console.log(window);
	
	return{
		
	video : {
		"val": Modernizr.video,
		"title": "HTML5 Video",
		"req" : true
	},
	
	audio : {
		"val": Modernizr.audio,
		"title" : "HTML5 Audio", 
		"req" : true
	},
	
	canvas: { 
		"val": Modernizr.canvas
	},
	
	file : {
		"val" : !!(window.File && window.FileReader && window.FileList && (window.URL || window.webkitURL))
	},
	
	webworkers : {
		"val" : Modernizr.webworkers
	},
	
	
	test :  function(){
		for(var key in this){
			if(typeof this[key] !== "function") console.log( this[key]["title"] + ":" + this[key]["val"] ) ;
		}
	},
	
	isVideoFormatSupported : function(mimeType){
		var res = mimeType.match("mp4|ogg|webm");
		if(Modernizr.video[res[0]] === true) return true;
		return false;
	},
	
	isAudioFormatSupported : function(mimeType){
		return true;
	}
	
	
	}
})(this,this.document);