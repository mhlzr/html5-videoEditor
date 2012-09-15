define(["backbone", "backbone-rel"],

    function (Backbone, BackboneRelational) {

        var File = Backbone.RelationalModel.extend({

            defaults : {
                ext        : null,
                url        : null,
                localUrl   : null,
                size       : 0,
                isComplete : false,
                isOriginal : true
            },

            initialize : function () {

            },

            validate : function (attrs) {
            }

        });

        return File;

    });