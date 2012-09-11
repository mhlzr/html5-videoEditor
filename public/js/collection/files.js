define(["backbone", "model/file"],

    function (Backbone, FileModel) {

        var Files = Backbone.Collection.extend({

            model : FileModel,

            url : function (models) {
                return '/animal/' + ( models ? 'set/' + _.pluck(models, 'id').join(';') + '/' : '' );
            },

            initialize : function () {

            },

            validate : function (attrs) {
            }

        });

        return Files;

    });