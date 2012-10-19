define(['backbone', 'model/asset'],

    function (Backbone, AssetModel) {

        return AssetModel.extend({

            idAttribute : '_id',

            defaults : {
                _id      : null,
                width    : 0,
                height   : 0,
                ratio    : 0,
                duration : 0,
                hasAudio : false
            },

            initialize : function () {

            }


        });

    });