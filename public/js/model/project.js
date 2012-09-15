define(["backbone", "backbone-rel", "model/asset", "collection/library", "model/composition", "collection/composition"],

    function (Backbone, BackboneRelational, AssetModel, LibraryCollection, CompositionModel, CompositionCollection) {

        var Project = Backbone.RelationalModel.extend({


            relations : [
                {
                    type           : Backbone.HasMany,
                    key            : "library",
                    relatedModel   : AssetModel,
                    collectionType : LibraryCollection,
                    createModels   : true
                },
                {
                    type           : Backbone.HasMany,
                    key            : "compositions",
                    relatedModel   : CompositionModel,
                    collectionType : CompositionCollection,
                    createModels   : true

                }
            ],

            urlRoot     : "/api/project/",
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
                //this.get("library").on("library:update", this.updateHandler, this);
                // this.get("compositions").on("composition:update", this.updateHandler, this);
            },

            validate : function (attrs) {
            },

            updateHandler : function (e) {
                console.log(e);
                this.save();
            }
        });

        return Project;

    });