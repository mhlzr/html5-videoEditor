define(["backbone", "backbone-rel", "model/sequence", "model/file"],

    function (Backbone, BackboneRelational, SequenceModel, FileModel) {

        var Composition = Backbone.RelationalModel.extend({

            relations:[
                {
                    type:Backbone.HasMany,
                    key:"sequences",
                    relatedModel:SequenceModel,
                    createModels:true,
                    reverseRelation:{
                        key:"composition",
                        includeInJSON:"_id"
                    }
                },
                {
                    type:Backbone.HasMany,
                    key:"encodedFiles",
                    relatedModel:FileModel,
                    createModels:true,
                    reverseRelation:{
                        key:"composition",
                        includeInJSON:"_id"
                    }
                }
            ],

            idAttribute:"_id",

            defaults:{
                _id:null,
                name:null,
                width:0,
                height:0,
                sequences:[],
                videoFiles:[],
                fps:0,
                duration:0,
                bitrate:0
            },

            initialize:function () {

            },

            validate:function (attrs) {
            }

        });

        return Composition;

    });