var LibraryListView = Backbone.View.extend({
			
			initialize : function(){

				this.model.bind("add", this.render);
			},
			
			render: function(){
				$(this.el).empty();
				
				//alert(JSON.stringify(this));


				
				_.each(this.models, function(model){
					$(this.el).append("<li>TEST" + model.get("name") + "</li>");
				});
				
				return this;
			}
		});