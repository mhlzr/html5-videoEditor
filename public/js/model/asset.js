define(["backbone", "backbone-rel", "model/file", "collection/files"],

    function (Backbone, BackboneRelational, FileModel, FileCollection) {

        var Asset = Backbone.RelationalModel.extend({


            subModelTypes : {
                "image" : "image",
                "video" : "video",
                "audio" : "audio"
            },

            relations : [
                {
                    type           : Backbone.HasMany,
                    key            : "files",
                    relatedModel   : FileModel,
                    collectionType : FileCollection,
                    createModels   : true
                }
            ],

            defaults : {
                name      : null,
                type      : "video",
                width     : 0,
                height    : 0,
                ratio     : 0,
                framerate : 0,
                duration  : 0
            },

            initialize : function () {

            },

            validate : function (attrs) {
            }

        });

        return Asset;

    })
;