define(["backbone", "model/composition"],

    function (Backbone, CompositionModel) {

        var Compositions = Backbone.Collection.extend({

            model:CompositionModel,

            url:function (models) {
                return '/animal/' + ( models ? 'set/' + _.pluck(models, 'id').join(';') + '/' : '' );
            },

            initialize:function () {

            },

            validate:function (attrs) {
            }

        });

        return Compositions;

    });