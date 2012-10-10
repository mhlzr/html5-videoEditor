define(["backbone", "model/file"],

    function (Backbone, FileModel) {

        var Files = Backbone.Collection.extend({

            model : FileModel,

            initialize : function(){
                console.log('FILES.JS::INIT');
            }

        });

        return Files;

    });