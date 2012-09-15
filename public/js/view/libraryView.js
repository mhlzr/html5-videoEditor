define(["jquery", "backbone", "hbs!templates/library"],

    function ($, Backbone, Template) {

        var LibraryListView = Backbone.View.extend({


            initialize : function () {
                this.collection.on('add', this.render);
            },

            comparator : function (asset) {
                return asset.get("name");
            },

            events : {
                "click li" : "elementClickHandler"
            },

            elementClickHandler : function (e) {
                console.log(e.target);
            },

            render : function () {

                if (!this.collection) return;

                console.log("LIBRARYVIEW.JS::RENDERING");

                this.$el.html(Template({assets : this.collection.toJSON()}));

                return this;
            }
        });

        return LibraryListView;

    })
;