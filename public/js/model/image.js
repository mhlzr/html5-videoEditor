define(["backbone", "model/asset"],

    function (Backbone, AssetModel) {

        var ImageAsset = AssetModel.extend({

            idAttribute:"_id",

            initialize:function () {

            },

            validate:function (attrs) {
            }

        });

        return ImageAsset;

    });