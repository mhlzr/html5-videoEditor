var Video = Backbone.Model.extend({
	
    defaults: {
		name : "",
        width: 0,
        height: 0,
        ratio: 0,
        localUrl: null,
		size : 0,
		type : "",
    },
    initialize: function () {
		

		console.log(this.get("type"));

		
        this.bind("change:width", function () {
            console.log("changed:width: ", this.get("width"));
        })
    }
});