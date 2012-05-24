var Library = Backbone.Collection.extend({
	
	model: Video,
	
	initialize : function(){
		this.bind("add", function(video){ console.log(video.name) });
	},
	
	
});