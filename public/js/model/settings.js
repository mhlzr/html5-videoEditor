define(['backbone', 'underscore', 'jstorage'],

    function (Backbone, _) {

        return Backbone.Model.extend({

            defaults : {
                useExternalPreview      : true,
                autoUpload              : true,
                autoTranscode           : true,
                serverMetaDataExclusive : false
            },

            initialize : function () {

                console.log('SETTINGS.JS::INIT');

                _.bindAll(this, 'saveSettingsToLocalStorage', 'readSettingsFromLocalStorage');

                this.on('change', this.saveSettingsToLocalStorage);
                this.readSettingsFromLocalStorage();
            },

            readSettingsFromLocalStorage : function () {
                //TODO  readSettingsFromLocalStorage
            },

            saveSettingsToLocalStorage : function () {
                //TODO saveSettingsToLocalStorage
            }

        });

    })
;
