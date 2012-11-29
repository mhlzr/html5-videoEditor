define(['underscore', 'backbone', 'backbone-rel', 'model/asset', 'collection/library', 'model/composition', 'collection/compositions', 'device'],

    function (_, Backbone, BackboneRelational, AssetModel, LibraryCollection, CompositionModel, CompositionCollection) {

        return Backbone.RelationalModel.extend({


            relations : [
                {
                    type            : Backbone.HasMany,
                    key             : 'library',
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
                    key             : 'compositions',
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

            url : 'project',

            idAttribute : '_id',

            defaults : {
                _id          : null,
                title        : 'Untitled',
                date         : new Date(),
                assetFolder  : null,
                library      : null,
                compositions : null
            },

            initialize : function () {
                "use strict";

                _.bindAll(this, 'changeHandler', 'destroyHandler');

                this.get('library').on('add', this.changeHandler);
                this.get('library').on('remove', this.changeHandler);
                this.get('compositions').on('add', this.changeHandler);
                this.get('compositions').on('remove', this.changeHandler);

                this.on('change:title', this.changeHandler);

                this.on('destroy', this.destroyHandler);
            },

            changeHandler : function () {
                "use strict";
                if (this.isNew()) return;

                //update locally
                app.device.saveProjectToLocalStorage(this.id, this.get('title'), this.get('date'));

                this.save();
            },

            destroyHandler : function () {
                "use strict";
                this.get('library').destroy();
                this.get('compositions').destroy();
            }

        });
    });