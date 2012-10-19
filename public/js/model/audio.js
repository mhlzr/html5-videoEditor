define(['backbone', 'model/asset'],

    function (Backbone, AssetModel) {

        return AssetModel.extend({

            idAttribute : '_id',

            defaults : {
                duration : 0
            },

            initialize : function () {

            }

        });


    });