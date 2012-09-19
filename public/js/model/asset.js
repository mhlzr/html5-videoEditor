define(["backbone", "backbone-rel", "model/file", "collection/files", "uuid", 'config'],

    function (Backbone, BackboneRelational, FileModel, FileCollection, Uuid, Config) {

        var Asset = Backbone.RelationalModel.extend({


            subModelTypes : {
                "image" : "image",
                "video" : "video",
                "audio" : "audio"
            },

            relations : [
                {
                    type            : Backbone.HasMany,
                    key             : "files",
                    relatedModel    : FileModel,
                    collectionType  : FileCollection,
                    createModels    : true,
                    reverseRelation : {
                        key           : 'id',
                        includeInJSON : 'assetId'
                    }
                }
            ],

            idAttribute : "id",

            defaults : {
                id          : null,
                name        : null,
                type        : "video",
                hasMetaData : false,
                fps         : null,
                progress    : 0,
                width       : 0,
                height      : 0,
                ratio       : 0,
                framerate   : 0,
                duration    : 0,
                status      : 'Analyzing' //Analyzing, Queued for Upload, Uploading, Queued for Transcoding, Transcoding, All done!
            },

            initialize : function () {

                console.log('ASSET.JS::INIT');

                _.bindAll(this, 'analyze', 'metaDataFallback', 'hasCompatibleMedia', 'markAsReady');

                this.set('id', Uuid.v4(), {silent : true});

            },

            analyze : function () {
                //no need if already done
                if (!this.hasMetaData) {

                    //if the media is not supported, the metadata will be
                    //extracted on the server-side
                    if (this.hasCompatibleMedia()) {
                        this.getMetadata();
                    }
                    else {
                        this.set('hasMetaData', false, {silent : true});
                        this.markAsReady();
                    }
                }
                else this.markAsReady();
            },

            markAsReady      : function () {
                console.log('ASSET.JS::MARK AS READY');
                this.set('status', 'Queued for Upload', {silent : true});
                this.trigger('analyzed', this);

            },

            //if the file is supported, but metaData can't be read
            metaDataFallback : function () {
                if (!this.get('hasMetaData')) {
                    this.markAsReady();
                }
            },

            hasCompatibleMedia : function () {
                return this.getCompatibleMedia() !== null;
            },

            getCompatibleMedia : function () {

                var files = this.get('files'),
                    l = files.length,
                    type = this.get('type'),
                    i, ext, localUrl, url;

                for (i = 0; i < l; i++) {

                    ext = files.at(i).get('ext');
                    url = files.at(i).get('url');
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

                return null;

            },

            getMetadata : function () {
                console.log('ASSET.JS::GET METADATA');

                var localUrl = this.get('files').at(0).get('localUrl') || null,
                    self = this,
                    type = this.get('type'),
                    player, image;

                if (!localUrl) {
                    this.markAsReady();
                    return;
                }

                if (type === 'image') {
                    image = new Image();
                    image.addEventListener('load', function onLoaded() {
                        self.set('width', image.width, {silent : true});
                        self.set('height', image.height, {silent : true});
                        self.set('ratio', self.get('width') / self.get('height') || 0, {silent : true});
                        image.src = null;
                        image = null;
                        self.set('hasMetaData', true, {silent : true});
                        self.markAsReady();
                    });
                    image.src = localUrl;

                }
                else {
                    player = document.createElement('video');

                    player.addEventListener('loadedmetadata', function onMetaData(e) {

                        self.set('duration', e.target.duration || 0, {silent : true});

                        if (type === 'video') {
                            self.set('width', e.target.videoWidth || 0, {silent : true});
                            self.set('height', e.target.videoHeight || 0, {silent : true});
                            self.set('ratio', self.get('width') / self.get('height') || 0, {silent : true});
                        }

                        player.removeEventListener('loadedmetadata', arguments.callee);
                        player.src = null;
                        player = null;
                        self.set('hasMetaData', true, {silent : true});
                        self.markAsReady();
                    });

                    player.src = localUrl;
                }

                window.setTimeout(self.metaDataFallback, Config.MEDIA_METADATA_ANALYZE_MAX_TIMEOUT);

            },

            getMissingFileFormats : function () {
                var neededFormats = Config.MEDIA_NEEDED_FORMATS[this.get('type')],
                    availableFormats = this.get('files').pluck('ext');
                return _.difference(neededFormats, availableFormats);
            },

            checkStatus : function () {
                if (this.getMissingFileFormats().length === 0) {
                    this.set('status', 'All done!');
                }
            }

        });

        return Asset;

    })
;