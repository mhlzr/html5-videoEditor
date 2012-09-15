define(["backbone"],

    function (Backbone) {

        var Router = Backbone.Router.extend({

            routes : {
                ":id"         : "editor", // /#500da18fd35e9cfc0e00000e
                "preview/:id" : "preview", // /#preview/500da18fd35e9cfc0e00000e
                "*actions"    : "default" // default
            },

            editor : function (query, page) {
                //http://stackoverflow.com/questions/11985228/mongodb-node-check-if-objectid-is-valid
                if (/^[0-9a-fA-F]{24}$/.test(query)) {
                    app.project.set("_id", query).fetch({'success' : app.views.renderAll});
                }
            },

            preview : function (query, page) {
                // this.navigate()"/preview/#" + query; //node will handle this
            },

            default : function (actions) {
            }

        });

        return Router;

    });