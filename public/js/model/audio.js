define(["backbone", "model/asset"],

    function (Backbone, AssetModel) {

        var AudioAsset = AssetModel.extend({

            idAttribute : "_id",

            defaults : {
                duration : 0
            },

            initialize : function () {

            }

        });

        return AudioAsset;

    });