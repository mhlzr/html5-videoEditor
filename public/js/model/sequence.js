define(['backbone', 'backbone-rel'],

    function (Backbone) {

        return Backbone.RelationalModel.extend({


            //somehow using _id attribute didn't work out at all,
            // _id was and still is always (re)set to null, don't know where and why
            idAttribute : 'id',

            urlRoot : 'sequence',

            defaults : {
                name     : 'untitled',
                type     : 'video',
                x        : 0,
                y        : 0,
                width    : 0,
                height   : 0,
                scale    : 1.0,
                rotation : 0,
                index    : 0,
                position : 0,
                inFrame  : 0,
                outFrame : 0,
                fps      : 0,
                duration : 0,
                assetId  : null,
                effects  : null,
                useAudio : true,
                volume   : 1
            },


            initialize : function () {
                this.on('change', this.changeHandler);
            },

            getAsset : function () {
                "use strict";
                if (!this.has('assetId')) return null;
                return app.project.get('library').get(this.get('assetId'))
            },

            changeHandler : function () {
                "use strict";

                //no need to resave here
                if (this.hasChanged('id')) return;

                this.save();

            }

        });


    }
);