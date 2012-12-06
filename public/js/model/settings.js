define(['backbone', 'device'],

    function (Backbone, Device) {

        return Backbone.Model.extend({

            defaults : {
                useExternalPreview        : true,
                autoUpload                : true,
                autoTranscode             : false,
                autoHideNavigatorOnRotate : true,
                serverMetaDataExclusive   : false
            },

            initialize : function () {
                this.on('change', this.saveSettingsToLocalStorage);
                this.readSettingsFromLocalStorage();
            },

            readSettingsFromLocalStorage : function () {
                var settings = Device.getSettingsFromLocalStorage(),
                    self = this;

                if (!settings) return; //no settings stored on this machine

                _.each(settings, function (value, key) {
                    self.set(key, value);
                })
            },

            saveSettingsToLocalStorage : function () {
                Device.saveSettingsToLocalStorage(this.toJSON());
            }

        });

    })
;
