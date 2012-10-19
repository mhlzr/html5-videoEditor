define(["backbone", "model/composition"],

    function (Backbone, CompositionModel) {

        return Backbone.Collection.extend({

            model : CompositionModel,

            url : 'compositions',

            initialize : function () {
                console.log('COMPOSITIONS.JS::INIT');
            }

        });


    });