/**
 * User: Matthieu Holzer
 * Date: 06.11.12
 * Time: 21:03
 */
define(["backbone", "model/sequence"],

    function (Backbone, CompositionModel) {

        return Backbone.Collection.extend({

            model : CompositionModel,
            url   : 'sequences',

            initialize : function () {
                "use strict";

                //automatically delete element if it gets removed
                this.on('remove', function (element) {
                    element.destroy();
                });
            },

            //sequences can be stacked and overlap, that's
            //why we need a comparator
            comparator : function (sequence) {
                "use strict";
                return sequence.get('stack')
            }

        });


    });