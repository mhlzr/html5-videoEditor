define(['backbone', 'model/file'],

    function (Backbone, FileModel) {

        return Backbone.Collection.extend({

            model : FileModel,
            url   : 'files',

            initialize : function () {
                'use strict';

                //automatically delete element if it gets removed
                this.on('remove', function (element) {
                    element.destroy();
                });
            }
        });


    });