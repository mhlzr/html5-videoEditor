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
                _id       : null,
                name      : 'Untitled',
                width     : 720,
                height    : 576,
                ratio     : 1.25,
                playHead  : 0,
                fps       : 25,
                duration  : 130, //secondsTotal
                durationH : 0,
                durationM : 5,
                durationS : 30,
                scale     : 1.0,
                rotation  : 0,
                publicId  : null
            },

            initialize : function () {
                "use strict";
                this.on('change:durationH', this.calculateDuration);
                this.on('change:durationM', this.calculateDuration);
                this.on('change:durationS', this.calculateDuration);
                this.on('change:width', this.calculateRatio);
                this.on('change:height', this.calculateRatio);

                this.on('sequences:add', this.sequenceAddedHandler);
            },

            sequenceAddedHandler : function (sequence) {
                "use strict";
                console.log('ADDED');
            },

            initServerUpdateListener : function () {
                //TODO
            },

            calculateDuration : function () {
                "use strict";
                this.set('duration', this.get('durationH') * 3600 + this.get('durationM') * 60 + this.get('durationS'));
            },

            calculateRatio : function () {
                "use strict";
                this.set('ratio', Math.roundDec(this.get('width') / this.get('height'), 2));
            },

            getTotalFrames : function () {
                "use strict";
                return this.get('fps') * this.get('duration');
            },

            validate : function () {
                //TODO

            }

        });


    });