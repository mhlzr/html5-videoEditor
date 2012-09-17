define(["backbone", "model/asset"],

    function (Backbone, AssetModel) {

        var Library = Backbone.Collection.extend({

            model   : AssetModel,

            initialize : function () {
                _.bindAll(this, 'assetAddHandler', 'assetRemoveHandler');
                this.on("add", this.assetAddHandler, this);
                this.on("remove", this.assetRemoveHandler, this);
            },

            validate : function (attrs) {
            },

            assetAddHandler : function (asset) {

            },

            assetRemoveHandler : function (e) {

            },

            getNewestAsset : function (e) {
                return this.at(this.length-1);
            }

        });

        return Library;

    });