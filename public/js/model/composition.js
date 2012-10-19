define(['backbone', 'backbone-rel', 'model/sequence', 'model/file'],

    function (Backbone, BackboneRelational, SequenceModel, FileModel) {

        return Backbone.RelationalModel.extend({

            relations : [
                {
                    type            : Backbone.HasMany,
                    key             : 'sequences',
                    relatedModel    : SequenceModel,
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
                fps      : 0,
                duration : 0,
                bitrate  : 0,
                publicId : null
            },

            initialize : function () {

            }

        });


    });