define(["backbone", "backbone-rel"],

    function (Backbone, BackboneRelational) {

        var File = Backbone.RelationalModel.extend({

            defaults : {
                _id              : null,
                ext              : null,
                remoteUrl        : null,
                localUrl         : null,
                localFile        : null,
                size             : 0,
                transmittedBytes : 0,
                isComplete       : false,
                isOriginal       : true
            },

            idAttribute : "_id",

            url    : 'file',

            //Overwrite, because we don't need the
            //localURL or localFile-Object saved
            toJSON : function () {
                return{
                    '_id'              : this.get('_id'),
                    'assetId'          : this.assetId || this.get('assetId'),
                    'ext'              : this.get('ext'),
                    'remoteUrl'        : this.get('remoteUrl'),
                    'size'             : this.get('size'),
                    'isComplete'       : this.get('isComplete'),
                    'isOriginal'       : this.get('isOriginal'),
                    'transmittedBytes' : this.get('transmittedBytes')
                }
            },

            initialize : function () {

                console.log('FILE.JS::INIT');

                this.on('destroy', this.destroyHandler);
                this.on('change', this.changeHandler);

                if (this.isNew()) {
                    var file = this.get('localFile');
                    this.set('ext', this.getFileExtensionByName(file.name), {silent : true});
                    this.set('size', file.size, {silent : true});
                    this.set('remoteUrl', file.name, {silent : true});
                    this.set('localUrl', this.createLocalFileUrl(file), {silent : true});
                }

            },

            changeHandler : function (data) {
                console.log('FILE.JS::CHANGE');
            },

            destroyHandler : function () {
                this.revokeLocalFileUrl(this.get('localUrl'));
            },

            getFileExtensionByName : function (fileName) {
                var regEx = /\.([^\.]+)$/;
                return ext = regEx.test(fileName) ? regEx.exec(fileName)[1].toString() : null;
            },

            createLocalFileUrl : function (file) {
                return (window.webkitURL || window.URL).createObjectURL(file);
            },

            revokeLocalFileUrl : function (url) {
                return (window.webkitURL || window.URL).revokeObjectURL(url);
            }

        });

        return File;

    })
;
