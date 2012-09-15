/**.
 * User: Matthieu Holzer
 * Date: 12.09.12
 * Time: 17:10
 */
define(["jquery", "Config"], function ($, Config) {

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

            $("#uploadInput").on("change", this.uploadInputChangeHandler);
            $("button").on("click", this.buttonHandler);

            $(app.uploader).on("progress complete", this.uploadProgressHandler);

        },

        onWindowResize : function () {
            app.device.setWindowDimensions($(window).width(), $(window).height());
        },

        windowEventHandler : function (e) {

            if (e.type === "beforeunload" || e.type === "unload") {
                return "There are still some uploads pending ...";
            }

        },

        uploadProgressHandler : function (e, params) {
            if (e.type === "complete") {
                app.info.noty({text : params.fileName + " is complete!" });
            }
            console.log(e.type, params);
        },

        uploadInputChangeHandler : function (e) {


            var file, type, ext, localUrl, name;
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
                        localUrl   : localUrl,
                        size       : file.size,
                        isComplete : false,
                        isOriginal : true
                    }
                });

                app.uploader.addFile(e.target.files[i], app.project.get("_id"), 0);
            }
        },

        buttonHandler : function (e) {

            var project = app.project;

            switch (e.target.id) {

                case "dumpProject" :
                    console.log(project.toJSON());
                    $("#output").text(JSON.stringify(project.toJSON()));
                    break;
                case "saveLocalBtn":
                    console.log(project.get("_id"));
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
                    project.save();
                    break;
                case "deleteBtn":
                    project.destroy();
                    break;
                case "addSequenceToCompBtn":
                    console.log("ADDING SEQUENCE");
                    project.get("compositions").add(new SequenceModel());
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