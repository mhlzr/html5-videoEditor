define(['backbone', 'model/asset'],

    function (Backbone, AssetModel) {

        return AssetModel.extend({

            idAttribute : '_id',

            defaults : {
                width  : 0,
                height : 0,
                ratio  : 0
            },

            initialize : function () {

            }


        });

    });