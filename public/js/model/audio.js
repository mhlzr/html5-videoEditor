define(["backbone", "model/asset"],

    function (Backbone, AssetModel) {

        var AudioAsset = AssetModel.extend({

            idAttribute : "_id",

            initialize : function () {

            },

            validate : function (attrs) {
            }

        });

        return AudioAsset;

    });