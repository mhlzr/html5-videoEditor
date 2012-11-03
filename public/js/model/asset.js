define(['backbone', 'underscore', 'model/file', 'collection/files', 'config', 'backbone-rel', 'backbone-bind'],

    function (Backbone, _, FileModel, FileCollection, Config) {

        return Backbone.RelationalModel.extend({

                idAttribute : '_id',


                subModelTypes : {
                    'image' : 'image',
                    'video' : 'video',
                    'audio' : 'audio'
                },

                urlRoot : 'asset',

                relations : [
                    {
                        type            : Backbone.HasMany,
                        key             : 'files',
                        relatedModel    : FileModel,
                        collectionType  : FileCollection,
                        createModels    : false,
                        includeInJSON   : 'id',
                        reverseRelation : {
                            key           : 'assetId',
                            includeInJSON : '_id'
                        }
                    }
                ],


                defaults : {
                    _id         : null,
                    name        : null,
                    type        : 'video',
                    isAnalyzed  : false,
                    hasMetaData : false,
                    fps         : null,
                    progress    : 0,
                    width       : 0,
                    height      : 0,
                    ratio       : 0,
                    duration    : 0,
                    status      : 'Analyzing' //Analyzing, Queued for Upload, Uploading, Queued for Transcoding, Transcoding, All done!
                },

                initialize : function () {

                    console.log('ASSET.JS::INIT');

                    _.bindAll(this, 'fileAddHandler', 'fileChangeHandler',
                        'onAnalyzed', 'sendFileToUploader',
                        'analyze', 'metaDataFallback', 'hasCompatibleMedia', 'markAsReady',
                        'changeHandler', 'initServerUpdateListener', 'serverUpdateHandler');

                    this.on('change', this.changeHandler);
                    this.on('analyzed', this.onAnalyzed);

                    this.get('files').on('add', this.fileAddHandler);
                    this.get('files').on('change', this.fileChangeHandler);

                    if (!this.isNew()) {
                        this.get('files').fetch({'data' : { 'id' : this.id }});
                        this.initServerUpdateListener();
                    }
                },

                initServerUpdateListener : function () {
                    this.ioBind('update', app.socket, this.serverUpdateHandler, this);
                },

                serverUpdateHandler : function (data) {

                    console.log('ASSET.JS::SERVER UPDATE');

                    _.each(data, function (val, key) {
                        this.set(key, val);
                    }, this);

                },

                fileAddHandler : function (file) {
                    console.log('ASSET.JS::FILE ADDED');
                    var originalFile = this.getOriginalFile().get('localFile');
                    this.set('type', this.getAssetTypeByFile(originalFile), {silent : true});
                    this.set('name', this.getCleanFileName(originalFile.name), {silent : true});
                },

                changeHandler : function () {
                    this.save();
                },

                fileChangeHandler : function (file) {

                    //when a original file was uploaded completly
                    //it should get transcoded if needed
                    if (file.get('isOriginal') && file.get('isComplete')) {
                        app.uploader.removeFile(file);
                        this.set('progress', 100);
                        this.set('status', 'Queued for Transcoding');
                        if (app.settings.get('autoTranscode')) this.sendTranscodingJobs(file);
                    }

                    //update from encoder
                    else if (file.hasChanged('encodingProgress')) {
                        var amountTotal, progressTotal;

                        this.get('files').each(function (file) {
                            if (!file.get('isOriginal')) {
                                amountTotal++;
                                progressTotal = file.get('encodingProgress');
                            }
                        });


                        this.set('progress', Math.roundDec(progressTotal / amountTotal));
                    }

                    //update from uploader
                    else if (file.hasChanged('byteOffset') && !file.get('isComplete')) {
                        this.set('progress', Math.roundDec(this.getOriginalFile().get('byteOffset') / this.getOriginalFile().get('size') * 100));
                        this.set('status', 'Uploading');
                        app.uploader.processFile(file);

                    }

                },

                onAnalyzed : function () {
                    console.log('ASSET.JS::ANALYZED', this.id);
                    if (!this.getOriginalFile().get('isComplete')) {
                        if (app.settings.get('autoUpload')) this.sendFileToUploader();
                    }
                },

                sendFileToUploader : function () {
                    app.uploader.addFile(this.getOriginalFile());
                    app.uploader.start();
                },


                sendTranscodingJobs : function (originalFile) {

                    var formats = this.getMissingFileFormats();

                    if (formats.length > 0) {

                        app.socket.emit('transcode', {
                            'projectId' : app.project.id,
                            'id'        : originalFile.id,
                            'formats'   : formats
                        })
                    }
                },

                analyze : function () {

                    //no need if already done
                    if (!this.get('hasMetaData')) {

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
                    this.set('isAnalyzed', true, {silent : true});
                    this.set('status', 'Queued for Upload');
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

                    //TODO change this
                        path = window.location.protocol + '//' + window.location.host + '/projects/' + app.project.get('assetFolder') + '/assets/',
                        i, ext, localUrl, url;

                    for (i = 0; i < l; i++) {

                        ext = files.at(i).get('ext');
                        url = path + files.at(i).getRemoteFileUrl();
                        localUrl = files.at(i).get('localUrl');

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
                        if (type === 'audio') {
                            player = document.createElement('audio');
                        }
                        else if (type === 'video') {
                            player = document.createElement('video');
                        }

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

                getOriginalFile : function () {
                    //underscore filter stuff didn't work somehow
                    var files = this.get('files');

                    for (var i = 0; i < files.length; i++) {
                        if (files.at(i).get('isOriginal') === true) {
                            return files.at(i);
                        }
                    }
                    return null;
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
                },

                getCleanFileName : function (fileName) {
                    var regEx = new RegExp(/(.+?)(\.[^.]*$|$)/);
                    if (regEx.test(fileName)) {
                        return $.trim(regEx.exec(fileName)[1].substr(0, Config.GUI_MAX_FILENAME_LENGTH));
                    }
                    return null;
                },

                getAssetTypeByExtension : function (ext) {
                    if (_.include(Config.UPLOADER_SUPPORTED_VIDEO_TYPES, ext)) return 'video';
                    else if (_.include(Config.UPLOADER_SUPPORTED_AUDIO_TYPES, ext)) return 'audio';
                    else if (_.include(Config.UPLOADER_SUPPORTED_IMAGE_TYPES, ext)) return 'image';

                    return null;
                },

                getAssetTypeByFile : function (file) {
                    var mimeReg = new RegExp(/video|image|audio/),
                        extReg = new RegExp(/\.([^\.]+)$/),
                        mime = mimeReg.test(file.type) ? mimeReg.exec(file.type)[0].toString() : null,
                        ext = extReg.test(file.name) ? extReg.exec(file.name)[1].toString() : null;

                    if (!mime && !ext) return null;
                    else if (mime) return mime;
                    else return this.getAssetTypeByExtension(ext);

                }

            }

        )
    })
;