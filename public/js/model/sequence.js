define(['backbone', 'backbone-rel', 'model/asset'],

    function (Backbone, BackboneRelational, AssetModel) {

        return Backbone.RelationalModel.extend({


            idAttribute : '_id',

            urlRoot : 'sequence',

            defaults : {
                _id       : null,
                scale     : 1,
                x         : 0,
                y         : 0,
                rotation  : 0,
                index     : 0,
                startTime : 0,
                inTime    : 0,
                outTime   : 0,
                length    : 0,
                assetId   : null,
                effects   : null,
                useAudio  : true
            },


            initialize : function () {

            }

        });


    });