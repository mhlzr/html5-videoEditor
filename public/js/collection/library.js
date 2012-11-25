define(["backbone", "model/asset"],

    function (Backbone, AssetModel) {

        return Backbone.Collection.extend({

            model : AssetModel,
            url   : 'library',

            initialize : function () {
                "use strict";

                this.on('remove', function (asset) {
                    asset.destroy();
                });

            },

            destroy : function () {
                "use strict";

                this.each(function (asset) {
                    asset.destroy();
                })
            }

        });

    });