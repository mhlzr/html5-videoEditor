define(["backbone", "backbone-rel", "model/file"],

    function (Backbone, BackboneRelational, FileModel) {

        var Asset = Backbone.RelationalModel.extend({

            subModelTypes : {
                "video" : "VideoAsset",
                "audio" : "AudioAsset",
                "image" : "ImageAsset"
            },

            relations : [
                {
                    type            : Backbone.HasMany,
                    key             : "files",
                    relatedModel    : FileModel,
                    createModels    : true,
                    reverseRelation : {
                        key           : "asset",
                        includeInJSON : "_id"
                    }
                }
            ],

            idAttribute : "_id",

            defaults : {
                name      : null,
                files     : null,
                width     : 0,
                height    : 0,
                ratio     : 0,
                localUrl  : null,
                framerate : 0,
                size      : 0,
                type      : "video",
                hasAudio  : false,
                hash      : null
            },

            initialize : function () {

            },

            validate : function (attrs) {
            }

        });

        return Asset;

    });