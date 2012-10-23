define(['backbone', 'underscore', 'backbone-rel', 'backbone-bind'],

    function (Backbone, _) {

        return Backbone.RelationalModel.extend({

            //somehow using _id attribute didn't work out at all,
            // _id was and still is always (re)set to null, don't know where and why
            idAttribute : 'id',
            urlRoot     : 'file',

            defaults : {
                ext              : null,
                remoteFileName   : null,
                localUrl         : null,
                localFile        : null,
                size             : 0,
                encodingProgress : 0,
                byteOffset       : 0,
                isComplete       : false,
                isOriginal       : false
            },


            initialize : function () {

                console.log('FILE.JS::INIT');

                _.bindAll(this, 'initServerUpdateListener', 'serverUpdateHandler');

                this.on('destroy', this.destroyHandler);

                //was just created
                if (this.isNew() && this.has('localFile')) {

                    var file = this.get('localFile');
                    this.set('ext', this.getFileExtensionByName(file.name), {silent : true});
                    this.set('size', file.size, {silent : true});
                    this.set('remoteFileName', this.getFileNameWithoutExtension(file.name), {silent : true});

                    if (this.get('isOriginal')) {
                        this.set('localUrl', this.createLocalFileUrl(file), {silent : true});
                    }
                }

                //got fetched from server
                if (!this.isNew()) {
                    this.initServerUpdateListener();
                }

            },

            initServerUpdateListener : function () {
                this.ioBind('update', app.socket, this.serverUpdateHandler, this);
            },

            serverUpdateHandler : function (data) {

                console.log('FILE.JS::SERVER UPDATE');

                _.each(data, function (val, key) {
                    this.set(key, val);
                }, this);

            },


            destroyHandler : function () {
                this.revokeLocalFileUrl(this.get('localUrl'));
            },

            getFileExtensionByName : function (fileName) {
                var regEx = new RegExp(/\.([^\.]+)$/);
                return regEx.test(fileName) ? regEx.exec(fileName)[1].toString() : null;
            },

            getFileNameWithoutExtension : function (fileName) {
                var regEx = new RegExp(/(.+?)(\.[^.]*$|$)/);
                return regEx.test(fileName) ? regEx.exec(fileName)[1].toString() : null;
            },

            createLocalFileUrl : function (file) {
                return (window.webkitURL || window.URL).createObjectURL(file);
            },

            revokeLocalFileUrl : function (url) {
                return (window.webkitURL || window.URL).revokeObjectURL(url);
            }

        })
            ;

    })
;
