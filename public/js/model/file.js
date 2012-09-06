define(["backbone", "backbone-rel"],

    function (Backbone, BackboneRelational) {

        var File = Backbone.RelationalModel.extend({

            idAttribute:"_id",

            defaults:{
                name:null,
                mime:null,
                url:null,
                localUrl:null,
                size:0,
                hash:null,
                isComplete:false,
                isOriginal:true
            },

            initialize:function () {

            },

            validate:function (attrs) {
            }

        });

        return File;

    });