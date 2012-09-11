define(["backbone", "backbone-rel", "model/file", "collection/files"],

    function (Backbone, BackboneRelational, FileModel, FileCollection) {

        var Asset = Backbone.RelationalModel.extend({

            subModelTypes : {
                "image" : "ImageAsset",
                "video" : "VideoAsset",
                "audio" : "AudioAsset"
            },

            relations : [
                {
                    type            : Backbone.HasMany,
                    key             : "files",
                    relatedModel    : FileModel,
                    collectionType  : FileCollection,
                    createModels    : true,
                    reverseRelation : {
                        key           : "asset",
                        includeInJSON : "_id"
                    }
                }
            ],

            idAttribute : "_id",

            defaults : {
                name : null,
                type : null
            },

            initialize : function () {
                this.bind("add:file", function (model, coll) {
                    console.log("ADDED SOMETHIN");
                });
            },

            validate : function (attrs) {
            }

        });

        return Asset;

    });