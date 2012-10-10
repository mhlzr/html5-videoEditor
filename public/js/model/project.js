define(["backbone", "backbone-rel", "model/asset", "collection/library", "model/composition", "collection/composition"],

    function (Backbone, BackboneRelational, AssetModel, LibraryCollection, CompositionModel, CompositionCollection) {

        var Project = Backbone.RelationalModel.extend({


            relations : [
                {
                    type            : Backbone.HasMany,
                    key             : "library",
                    relatedModel    : AssetModel,
                    collectionType  : LibraryCollection,
                    createModels    : true,
                    includeInJSON   : '_id',
                    reverseRelation : {
                        key           : 'projectId',
                        includeInJSON : '_id'
                    }
                },
                {
                    type            : Backbone.HasMany,
                    key             : "compositions",
                    relatedModel    : CompositionModel,
                    collectionType  : CompositionCollection,
                    includeInJSON   : '_id',
                    createModels    : true,
                    reverseRelation : {
                        key           : 'projectId',
                        includeInJSON : '_id'
                    }

                }
            ],

            url : "project",

            idAttribute : "_id",

            defaults : {
                _id          : null,
                title        : "Untitled",
                date         : new Date(),
                assetFolder  : null,
                library      : null,
                compositions : null
            },

            initialize : function () {
                this.on('change', this.changeHandler);
            },

            changeHandler : function () {
                console.log('PROJECT.JS::CHANGE');
            }
        });

        return Project;

    });