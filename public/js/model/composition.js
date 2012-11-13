define(['backbone', 'backbone-rel', 'model/sequence', 'model/file', 'collection/sequences', 'collection/files'],

    function (Backbone, BackboneRelational, SequenceModel, FileModel, SequenceCollection, FileCollection) {

        return Backbone.RelationalModel.extend({

            relations : [
                {
                    type            : Backbone.HasMany,
                    key             : 'sequences',
                    relatedModel    : SequenceModel,
                    collectionType  : SequenceCollection,
                    createModels    : true,
                    reverseRelation : {
                        key           : '_id',
                        includeInJSON : 'compositionId'
                    }
                },
                {
                    type            : Backbone.HasMany,
                    key             : 'files',
                    relatedModel    : FileModel,
                    collectionType  : FileCollection,
                    createModels    : true,
                    reverseRelation : {
                        key           : '_id',
                        includeInJSON : 'compositionId'
                    }
                }
            ],

            idAttribute : '_id',
            url         : 'composition',

            defaults : {
                _id      : null,
                name     : null,
                width    : 0,
                height   : 0,
                fps      : 25,
                duration : 60, //seconds
                scale    : 1.0,
                rotation : 0,
                publicId : null
            },

            initialize : function () {
                "use strict";
            },

            initServerUpdateListener : function () {
                //TODO
            },

            getTotalFrames : function(){
                "use strict";
                return this.get('fps') * this.get('duration');
            }

        });


    });