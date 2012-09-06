define(["backbone", "backbone-rel", "model/asset", "collection/library", "model/composition", "collection/composition"],

    function (Backbone, BackboneRelational, AssetModel, LibraryCollection, CompositionModel, CompositionCollection) {

        var Project = Backbone.RelationalModel.extend({


            relations:[
                {
                    type:Backbone.HasMany,
                    key:"library",
                    relatedModel:AssetModel,
                    collectionType:LibraryCollection,
                    createModels:true,
                    reverseRelation:{
                        key:"project",
                        includeInJSON:"_id"
                    }
                },
                {
                    type:Backbone.HasMany,
                    key:"compositions",
                    relatedModel:CompositionModel,
                    collectionType:CompositionCollection,
                    createModels:true,
                    reverseRelation:{
                        key:"project",
                        includeInJSON:"_id"
                    }

                }
            ],

            urlRoot:"/api/project/",
            idAttribute:"_id",

            defaults:{
                _id:null,
                name:"Untitled",
                date:new Date(),
                assetFolder:null,
                library:null,
                compositions:null
            },


            initialize:function () {

            },

            validate:function (attrs) {
            }

        });

        return Project;

    });