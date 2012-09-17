define(["backbone", "backbone-rel", "model/file", "collection/files", "uuid"],

    function (Backbone, BackboneRelational, FileModel, FileCollection, Uuid) {

        var Asset = Backbone.RelationalModel.extend({


            subModelTypes : {
                "image" : "image",
                "video" : "video",
                "audio" : "audio"
            },

            relations : [
                {
                    type           : Backbone.HasMany,
                    key            : "files",
                    relatedModel   : FileModel,
                    collectionType : FileCollection,
                    createModels   : true
                }
            ],

            idAttribute : "id",

            defaults : {
                id        : null,
                name      : null,
                type      : "video",
                width     : 0,
                height    : 0,
                ratio     : 0,
                framerate : 0,
                duration  : 0,
                status    : null //Analyzing, Queued, Uploading, Transcoding
            },

            initialize : function () {
                this.set('id', Uuid.v4());
                this.set('status', 'Analyzing');

                //if the media is not supported, the metadata will be
                //extracted on the server-side

                if (this.hasCompatibleMedia()) {
                    console.log("ASSET.JS::IS COMPATIBLE");
                    this.getMetadata();
                }
                else {
                    console.log("ASSET.JS::ISNOT COMPATIBLE");
                    this.set('status', 'Queued');
                }
            },

            hasCompatibleMedia : function () {
                return this.getCompatibleMedia() !== null;
            },

            getCompatibleMedia : function () {

                var files = this.get('files'),
                    l = files.length,
                    type = this.get('type'),
                    i, ext, localUrl;

                for (i = 0; i < l; i++) {

                    ext = files.at(i).get('ext');
                    localUrl = files.at(i).get('localUrl');

                    //TODO absolute url

                    if (type === 'image') {
                        return (localUrl) ? localUrl : url;
                    }

                    else if (type === 'video') {
                        if (app.device.isVideoFormatSupported(ext)) {
                            return (localUrl) ? localUrl : url;
                        }
                        else {
                            return null;
                        }

                    }
                    else if (type === 'audio') {
                        if (app.device.isAudioFormatSupported(ext)) {
                            return (localUrl) ? localUrl : url;
                        }
                        else {
                            return null;
                        }
                    }
                    else return null;
                }

            },

            getMetadata : function () {
                var localUrl = this.get('files').at(0).get('localUrl') || null,
                    self = this,
                    type = this.get('type'),
                    player, image;

                if (!localUrl) return;

                if (type === 'image') {
                    image = new Image();
                    image.addEventListener('load', function onLoaded() {
                        self.set('width', image.width);
                        self.set('height', image.height);
                        self.set('ratio', self.get('width') / self.get('height') || 0);
                        image.src = null;
                        image = null;
                        self.set('status', 'Queued');
                    });
                    image.src = localUrl;

                }
                else {
                    player = document.createElement('video');

                    player.addEventListener('loadedmetadata', function onMetaData(e) {

                        self.set('duration', e.target.duration || 0);

                        if (type === 'video') {
                            self.set('width', e.target.videoWidth || 0);
                            self.set('height', e.target.videoHeight || 0);
                            self.set('ratio', self.get('width') / self.get('height') || 0);
                        }

                        player.removeEventListener('loadedmetadata', arguments.callee);
                        player.src = null;
                        player = null;
                        self.set('status', 'Queued');
                    });

                    player.src = localUrl;
                }

            },

            validate : function (attrs) {
            }

        });

        return Asset;

    })
;