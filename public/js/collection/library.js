define(["backbone", "model/asset"],

    function (Backbone, AssetModel) {

        var Library = Backbone.Collection.extend({

            model:AssetModel,

            url:function (models) {
                return '/animal/' + ( models ? 'set/' + _.pluck(models, 'id').join(';') + '/' : '' );
            },

            initialize:function () {

            },

            validate:function (attrs) {
            }


        });

        return Library;

    });