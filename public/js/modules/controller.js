/**.
 * User: Matthieu Holzer
 * Date: 12.09.12
 * Time: 17:10
 */
define(["jquery", "Config", 'info', 'qrcode'], function ($, Config, Info) {

    var controller = {

        app : null,

        init : function (app) {
            this.app = app;
            this.addListeners();
            return this;
        },

        addListeners : function () {

            $(window).on("resize", this.onWindowResize);

            if (!Config.DEBUG) {
                window.onbeforeunload = this.windowEventHandler;
                window.onunload = this.windowEventHandler;
            }

            $("#fileBrowserButton").on("click", function () {
                $("#fileBrowser").click();
            });

            $("#fileBrowser").on("change", this.uploadInputChangeHandler);
            $("button").on("click", this.buttonHandler);

            $(app.uploader).on("progress complete", this.uploadProgressHandler);

            app.socket.on("transcoding:progress", this.transcodingProgressHandler);

        },

        transcodingProgressHandler : function (data) {

            var lib = app.project.get('library'),
                asset = lib.get(data.assetId);

            if (data.isComplete) {
                asset.set('progress', 100);
                asset.get('files').add({
                    'ext'        : data.format,
                    'size'       : data.size,
                    'isComplete' : true,
                    'isOriginal' : false,
                    'url'        : data.url
                });

                asset.checkStatus();

            }
            else {
                if (asset.get('status') != 'Transcoding') {
                    asset.set('status', 'Transcoding');
                }
                //if there are multiple transcoding jobs, this will keep the progressbar from jumping
                if ((asset.get('progress') < data.progress || asset.get('progress') === 100) && data.progress <= 100) {
                    asset.set('progress', data.progress);
                }
            }
        },

        onWindowResize : function () {
            app.device.setWindowDimensions($(window).width(), $(window).height());
        },

        windowEventHandler : function (e) {

            if (e.type === "beforeunload" || e.type === "unload") {
                app.project.save();
                return "There are still some uploads pending ...";
            }

        },

        uploadProgressHandler : function (e, params) {

            if (e.type === "complete") {
                app.project.get('library').get(params.assetId).set('progress', 0)
                    .set('status', 'Queued for Transcoding').get('files').at(0).set('isComplete', true);
                app.controller.sendTranscodingJob(params.assetId);

            }
            else {
                app.project.get('library').get(params.assetId).set('progress', params.progressRelative);
            }

        },

        sendTranscodingJob : function (assetId) {
            var asset = app.project.get('library').get(assetId),
                formats = asset.getMissingFileFormats();

            if (formats.length > 0) {
                app.socket.emit('transcode', {
                    'projectId'   : app.project.get('_id'),
                    'assetId'     : assetId,
                    'formats'     : formats,
                    'fileName'    : asset.get('files').at(0).get('url'),
                    'assetFolder' : app.project.get('assetFolder')
                })
            }
        },

        uploadInputChangeHandler : function (e) {

            var file, type, ext, localUrl, name, asset;
            for (var i = 0; i < e.target.files.length; i++) {

                file = e.target.files[i];
                type = app.uploader.getAssetTypeByFile(file);
                ext = app.uploader.getFileExtension(file.name);
                name = app.uploader.getCleanFileName(file.name);
                localUrl = app.uploader.createLocalFileUrl(file);

                if (!type || !file || !ext || !name || !localUrl) continue;

                app.project.get("library").add({
                    "type"  : type,
                    "name"  : name,
                    "files" : {
                        ext        : ext,
                        url        : file.name,
                        localFile  : file,
                        localUrl   : localUrl,
                        size       : file.size,
                        isComplete : false,
                        isOriginal : true
                    }
                });

            }

        },

        buttonHandler : function (e) {

            var project = app.project;

            switch (e.target.id) {

                case "dumpProject" :
                    console.log(project.toJSON());
                    break;
                case "saveLocalBtn":

                    $.jStorage.set(project.get("_id"), {
                        name : project.get("name"),
                        date : project.get("date")
                    });
                    break;

                case "fetchBtn":
                    project.fetch();
                    break;

                case "render" :
                    app.views.renderAll();

                case "clearLocalBtn":
                    $.jStorage.flush();
                    break;
                case "projectSyncBtn":
                    Backbone.sync;
                    break;
                case "saveBtn":
                    project.save({}, {'success' : function onSuccess() {
                        app.router.navigate('' + app.project.get('_id'), {trigger : true, replace : true});
                    }});

                    break;
                case "deleteBtn":
                    project.destroy();
                    break;
                case "addSequenceToCompBtn":
                    console.log("ADDING SEQUENCE");
                    project.get("compositions").add(new SequenceModel());
                    break;

                case 'share' :
                    Info.reveal($('#exportDialogue'));
                    $('#qrcode').empty().qrcode(window.location.href);
                    break;
                case "startBtn"  :
                    app.uploader.start();
                    break;
                case "stopBtn" :
                    app.uploader.stop();
                    break;

            }

        }

    };

    return controller;

})
;