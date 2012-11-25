define(["backbone", "model/composition"],

    function (Backbone, CompositionModel) {

        return Backbone.Collection.extend({

            model : CompositionModel,
            url   : 'compositions',

            initialize : function () {
                "use strict";

                this.on('remove', function (composition) {
                    composition.destroy();
                });
            },


            destroy : function () {
                "use strict";

                this.each(function (composition) {
                    composition.destroy();
                })
            }

        });

    });