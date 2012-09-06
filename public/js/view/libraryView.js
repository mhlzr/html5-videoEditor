define(["backbone", "jquery", "underscore", "handlebars"],

    function (Backbone, $, _, Handlebars) {

        var LibraryListView = Backbone.View.extend({

            el:$("#library"),

            initialize:function () {
                this.collection.bind("add", this.render, this);
            },

            render:function (e) {

                $(this.el).empty();

                console.log("RENDERING LIBRARY");


                _.each(this.collection, function (model) {
                    console.log("AH");
                    this.$el.append("<li>TEST" + model.get("name") + "</li>");
                });

                return this;
            }
        });

        return LibraryListView;

    });