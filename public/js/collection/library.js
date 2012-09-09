define(["backbone", "model/asset"],

    function (Backbone, AssetModel) {

        var Library = Backbone.Collection.extend({

            model   : AssetModel,
            urlRoot : "/api/",

            url : function (models) {
                console.log("/api/" + ( models ? 'set/' + _.pluck(models, 'id').join(';') + '/' : '' ));
                return ( models ? 'set/' + _.pluck(models, 'id').join(';') + '/' : '' );
            },

            initialize : function () {
                // this.on("add", Backbone.sync);
                // this.on("change", Backbone.sync);
            },

            validate : function (attrs) {
            }


        });

        return Library;

    });