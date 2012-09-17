define(["backbone", "backbone-rel", "model/sequence", "model/file"],

    function (Backbone, BackboneRelational, SequenceModel, FileModel) {

        var Composition = Backbone.RelationalModel.extend({

            relations : [
                {
                    type         : Backbone.HasMany,
                    key          : "sequences",
                    relatedModel : SequenceModel,
                    createModels : true
                },
                {
                    type         : Backbone.HasMany,
                    key          : "files",
                    relatedModel : FileModel,
                    createModels : true
                }
            ],

            idAttribute : "id",

            defaults : {
                id      : null,
                name     : null,
                width    : 0,
                height   : 0,
                fps      : 0,
                duration : 0,
                bitrate  : 0,
                publicId : null
            },

            initialize : function () {

            },

            validate : function (attrs) {
            }

        });

        return Composition;

    });