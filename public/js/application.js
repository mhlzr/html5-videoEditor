define([
    "config", "jquery", "jstorage", "backbone", "modernizr", "router",
    "modules/device", "modules/uploader.socket", "modules/callbackRegistry",
    "modules/info",
    "model/project", "view/libraryView", "model/asset", "model/video", "model/sequence"],

    function (Config, $, jStorage, Backbone, Modernizr, Router, Device, Uploader, CallbackReg, Info, ProjectModel, LibraryView, AssetModel, VideoModel, SequenceModel) {

        var app = app || {};

        app.device = Device;
        app.info = Info;

        app.project = app.project || {};
        app.views = app.views || {};
        app.router = app.router || {};


        app.initialize = function () {

            app.socket = io.connect("http://" + Config.WEBSOCKET_HOST + ":" + Config.WEBSOCKET_PORT);
            app.uploader = new Uploader(app.socket);

            console.log("APPLICATION.JS::INIT");

            if (!app.device.runBrowserSupportTest()) {
                console.log("Your browser is not supported");
                return;
            }

            this.router = new Router({
                app : this
            });

            app.info.noty( {text: 'noty - a jquery notification library!' });


            //configure Backbone to work with socket.io
            //http://blog.mayflower.de/archives/853-Backbone.Js-und-Socket.IO.html
            app.socket.callbackRegistry = CallbackReg;

            Backbone.sync = function (method, model, options) {

                var url = _.isFunction(model.url) ? model.url() : model.url,
                    payload = {
                        "model" : model,
                        "url"   : url,
                        "id"    : app.socket.callbackRegistry.addCallback(options)
                    };

                app.socket.emit(method, payload);
            };

            app.socket.on("reply", function (data) {
                app.socket.callbackRegistry.execCallbackById(data);

            });

            Backbone.setDomLibrary($);
            Backbone.history.start({
                pushState : true
            });

            this.getAvailableProjectsFromLocalStorage();
            this.project = new ProjectModel();

            /*


             this.views.library = new LibraryView({
             collection: this.project.get("library"),
             el: $("#library")
             });

             */

            //_.bindAll(this.get("project"), this.projectChangeHandler );

            $("button").on("click", this.buttonHandler);

            //TODO ONLY FOR TESTING UPLOAD!!     REMOVE THIS
            $("#uploadInput").on("change", uploadInputChangeHandler);
            //no jquery here
            //window.onbeforeunload = this.controller.windowEventHandler;
            //window.onunload = this.controller.windowEventHandler;

        };

        app.projectChangeHandler = function (e) {
            console.log(e);
        };

        app.getAvailableProjectsFromLocalStorage = function () {
            var localProjects = $.jStorage.index(),
                outputList = $("#availableProjects");

            var currentProj;

            for (var i = 0; i < localProjects.length; i++) {
                currentProj = $.jStorage.get(localProjects[i]);
                outputList.append("<li>" + localProjects[i] + ", " + currentProj.name + ", " + currentProj.date + "</li>");

            }
        };

        app.buttonHandler = function (e) {

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

                case "addAssetToLibBtn":
                    console.log("ADDING ASSET");
                    project.get("library").add(new VideoModel());
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

        };

        /*
         controller.windowEventHandler = function(e){

         if(e.type === "beforeunload" || e.type === "unload"){
         return "There are still some uploads pending ...";
         }

         }
         */

        return app;

    })