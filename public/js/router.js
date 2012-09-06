define(["backbone"],

    function (Backbone) {

        var Router = Backbone.Router.extend({

            routes:{
                ":id":"editor", // /#500da18fd35e9cfc0e00000e
                "preview/:id":"preview", // /#preview/500da18fd35e9cfc0e00000e
                "*actions":"default" // default
            },

            initialize:function (options) {
                this.application = options.application;
            },

            editor:function (query, page) {
                if (query.length === 24) {
                    this.application.get("project").set("_id", query).fetch();
                }
            },

            preview:function (query, page) {
                // window.location.href = "/preview/#" + query; //node will handle this
            },

            default:function (actions) {
            }

        });


        return Router;

    });