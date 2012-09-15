define([
    "config", "jquery", "jstorage", "backbone", "modernizr", "socket", "router",
    "modules/controller", "modules/device", "modules/uploader.socket", "modules/callbackRegistry", "info",
    "model/project", "view/libraryView", "view/projectInfoView", "model/asset", "model/sequence"],

    function (Config, $, jStorage, Backbone, Modernizr, Socket, Router, Controller, Device, Uploader, CallbackReg, Info, ProjectModel, LibraryView, ProjectInfoView, AssetModel, SequenceModel) {

        var app = {};

        app.device = Device;
        app.info = Info;
        app.socket = null;
        app.uploader = null;

        app.project = app.project || {};

        app.views = {};
        app.router = new Router();
        app.controller = null;

        app.initialize = function () {

            if (!this.device.runBrowserSupportTest()) {
                console.log("Your browser is not supported");
                return;
            }

            console.log("APPLICATION.JS::INIT");

            this.socket = Socket.connect("http://" + Config.WEBSOCKET_HOST + ":" + Config.WEBSOCKET_PORT);
            this.socket.callbackRegistry = CallbackReg;

            this.setupBackbone();

            this.uploader = new Uploader(this.socket);
            this.project = new ProjectModel();

            //this.info.noty({text : 'noty - a jquery notification library!' });
            //this.info.reveal($("#dialogueTest"));

            this.initViews();

            this.getAvailableProjectsFromLocalStorage();

            this.controller = Controller.init(this);

        };

        app.setupBackbone = function () {
            /*
             * Configuring Backbone & Overriding it's syncing method
             * to use socket.io, callbacks are stored in callbackRegistry
             *
             */
            Backbone.setDomLibrary($);
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
        };

        app.initViews = function () {

            app.views.library = new LibraryView({
                collection : app.project.get("library"),
                el         : $("#library")
            });

            app.views.projectInfo = new ProjectInfoView({
                model : app.project,
                el    : $("#projectInfo")
            });

            app.views.library.render();
            app.views.projectInfo.render();

            app.views.renderAll = function () {
                console.log("APPLICATION.JS::RENDERING ALL VIEWS");
                _.each(app.views, function (obj, key) {
                    if (_.isFunction(obj)) return;
                    if (_.isObject(obj)) obj.render();
                });
            };

        }

        app.getAvailableProjectsFromLocalStorage = function () {
            var localProjects = $.jStorage.index(),
                outputList = $("#availableProjects");

            var currentProj;

            for (var i = 0; i < localProjects.length; i++) {
                currentProj = $.jStorage.get(localProjects[i]);
                outputList.append("<li><a href='#" + localProjects[i] + "'>" + localProjects[i] + ", " + currentProj.name + ", " + currentProj.date + "</a></li>");

            }
        };

        return app;

    })