define(['backbone', 'model/file'],

    function (Backbone, FileModel) {

        return Backbone.Collection.extend({

            model : FileModel,
            url   : 'files',

            initialize : function () {
                console.log('FILES.JS::INIT');
            }

        });


    });