define(["backbone", "model/composition"],

    function (Backbone, CompositionModel) {

        var Compositions = Backbone.Collection.extend({

            model : CompositionModel,

            initialize : function () {
                console.log('COMPOSITIONS.JS::INIT');
            },

            validate : function (attrs) {
            }

        });

        return Compositions;

    });