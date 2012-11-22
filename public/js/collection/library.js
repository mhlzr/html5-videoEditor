define(["backbone", "model/asset"],

    function (Backbone, AssetModel) {

        return Backbone.Collection.extend({

            model : AssetModel,
            url   : 'library',

            initialize : function () {
                "use strict";

                //automatically delete element if it gets removed
                this.on('remove', function (element) {
                    element.destroy();
                });
            }

        });

    });