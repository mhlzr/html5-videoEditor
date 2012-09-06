define(["backbone", "model/asset"],

    function (Backbone, AssetModel) {

        var VideoAsset = AssetModel.extend({

            idAttribute:"_id",

            defaults:{
                width:0,
                height:0,
                ratio:0,
                framerate:0,
                hasAudio:false,
                codec:null
            },

            initialize:function () {

            },

            validate:function (attrs) {
            }

        });

        return VideoAsset;

    });