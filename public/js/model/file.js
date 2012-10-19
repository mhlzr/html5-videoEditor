define(['backbone', 'backbone-rel'],

    function (Backbone, BackboneRelational) {

        return Backbone.RelationalModel.extend({

            //somehow using _id attribute didn't work out at all,
            // _id was and still is always (re)set to null, don't know where and why
            idAttribute : 'id',
            url         : 'file',

            defaults : {
                id         : null,
                ext        : null,
                remoteUrl  : null,
                localUrl   : null,
                localFile  : null,
                size       : 0,
                byteOffset : 0,
                isComplete : false,
                isOriginal : false
            },


            initialize : function () {

                console.log('FILE.JS::INIT');

                this.on('destroy', this.destroyHandler);
                this.on('change', this.changeHandler);


                if (this.isNew() && this.has('localFile')) {
                    var file = this.get('localFile');
                    this.set('ext', this.getFileExtensionByName(file.name), {silent : true});
                    this.set('size', file.size, {silent : true});
                    this.set('remoteUrl', file.name, {silent : true});

                    if (this.get('isOriginal')) {
                        this.set('localUrl', this.createLocalFileUrl(file), {silent : true});
                    }
                }

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

    })
;
