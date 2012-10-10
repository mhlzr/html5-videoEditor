define(["backbone", "backbone-rel", "model/asset"],

    function (Backbone, BackboneRelational, AssetModel) {

        var Sequence = Backbone.RelationalModel.extend({


            idAttribute : "_id",

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
                asset     : null,
                effects   : null,
                useAudio  : true
            },

            url : 'sequence',

            initialize : function () {

            }

        });

        return Sequence;

    });