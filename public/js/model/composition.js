define(['underscore', 'backbone', 'backbone-rel', 'model/sequence', 'model/file', 'collection/sequences', 'collection/files'],

    function (_, Backbone, BackboneRelational, SequenceModel, FileModel, SequenceCollection, FileCollection) {

        return Backbone.RelationalModel.extend({

            relations : [
                {
                    type            : Backbone.HasMany,
                    key             : 'sequences',
                    relatedModel    : SequenceModel,
                    collectionType  : SequenceCollection,
                    createModels    : true,
                    includeInJSON   : 'id',
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
                    includeInJSON   : 'id',
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
                playhead  : 0,
                fps       : 25,
                duration  : 330, //secondsTotal
                durationH : 0,
                durationM : 5,
                durationS : 30,
                scale     : 1.0,
                rotation  : 0,
                publicId  : null //will be set server-side
            },

            initialize : function () {
                "use strict";

                _.bindAll(this, 'sequenceAddedHandler', 'destroyHandler');

                this.on('change:durationH', this.calculateDuration);
                this.on('change:durationM', this.calculateDuration);
                this.on('change:durationS', this.calculateDuration);
                this.on('change:width', this.calculateRatio);
                this.on('change:height', this.calculateRatio);

                this.get('sequences').on('add', this.sequenceAddedHandler);

                this.on('destroy', this.destroyHandler);

                if (!this.isNew()) {
                    this.get('sequences').fetch({'data' : { 'id' : this.id }});
                    this.get('files').fetch({'data' : { 'id' : this.id }});
                    this.initServerUpdateListener();
                }

                //force this once
                this.calculateDuration();
            },

            sequenceAddedHandler : function (sequence) {
                "use strict";
                sequence.set('index', this.getLowestIndex());
                this.save();
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

            getLowestIndex : function () {
                "use strict";
                //TODO iterate over all get new index
                return 4;
            },

            validate : function () {
                //TODO

            },

            sendEncodingRequest : function () {
                "use strict";

                app.socket.emit('encode', {
                    'projectId'     : app.project.id,
                    'compositionId' : this.id,
                    'format'        : {'foo' : 'bat'}
                });
            },

            destroyHandler : function () {
                "use strict";
                var self = this;

                //do a fetch for all the collections, to be sure, that they are all removed
                self.get('sequences').fetch({'data' : { 'id' : self.id }, 'success' : function () {
                    self.get('sequences').each(function (sequence) {
                        sequence.destroy();
                    });

                    self.get('files').fetch({'data' : { 'id' : self.id }, 'success' : function () {
                        self.get('files').each(function (file) {
                            file.destroy();
                        });
                    }});

                }});


            }

        });


    });