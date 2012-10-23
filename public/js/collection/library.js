define(["backbone", "model/asset"],

    function (Backbone, AssetModel) {

        return Backbone.Collection.extend({

            model : AssetModel,
            url   : 'library',

            initialize : function () {
                console.log('LIBRARY.JS::INIT');
            }

        });

    });