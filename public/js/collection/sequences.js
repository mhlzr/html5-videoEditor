/**
 * User: Matthieu Holzer
 * Date: 06.11.12
 * Time: 21:03
 */
define(["backbone", "model/sequence"],

    function (Backbone, CompositionModel) {

        return Backbone.Collection.extend({

            model : CompositionModel,

            url : 'sequences',

            initialize : function () {
                "use strict";
            }

        });


    });