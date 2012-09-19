define(["backbone", "backbone-rel"],

    function (Backbone, BackboneRelational) {

        var File = Backbone.RelationalModel.extend({

            defaults : {
                ext        : null,
                url        : null,
                localUrl   : null,
                localFile  : null,
                size       : 0,
                isComplete : false,
                isOriginal : true
            },

            //Overwrite, because we don't need the
            // localURL or localFile-Object saved
            toJSON   : function () {
                return{
                    'ext'        : this.get('ext'),
                    'url'        : this.get('url'),
                    'size'       : this.get('size'),
                    'isComplete' : this.get('isComplete'),
                    'isOriginal' : this.get('isOriginal')
                }
            },

            initialize : function () {

            },

            validate : function (attrs) {
            }

        });

        return File;

    });
