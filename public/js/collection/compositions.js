define(["backbone", "model/composition"],

    function (Backbone, CompositionModel) {

        return Backbone.Collection.extend({

            model : CompositionModel,
            url   : 'compositions',

            initialize : function () {
                "use strict";

                //automatically delete element if it gets removed
                this.on('remove', function (element) {
                    element.destroy();
                });
            }

        });

    });