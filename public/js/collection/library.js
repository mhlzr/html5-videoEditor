define(["backbone", "model/asset"],

    function (Backbone, AssetModel) {

        var Library = Backbone.Collection.extend({

            model   : AssetModel,
            urlRoot : "/api/",


            initialize : function () {
               // this.on("add", this.assetRemoveHandler, this);
            },

            validate : function (attrs) {
            }   ,

            assetRemoveHandler : function(e){
                this.trigger("library:update");
            }


        });

        return Library;

    });