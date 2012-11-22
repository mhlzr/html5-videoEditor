define([
    'config', 'jquery', 'backbone', 'modernizr', 'socket', 'router',
    'controller', 'model/settings', 'device', 'modules/uploader.socket', 'info',
    'model/project',
    'view/libraryListView', 'view/compositionListView', 'view/projectInfoView',
    'backbone-bind', 'backbone-sync'],

    function (Config, $, Backbone, Modernizr, Socket, Router, Controller, Settings, Device, Uploader, Info, ProjectModel, LibraryListView, CompositionListView, ProjectInfoView) {

        'use strict';

        var app = {};

        app.device = Device;
        app.info = Info;
        app.uploader = null;

        app.project = app.project || {};

        app.views = {};
        app.controller = null;
        app.socket = null;

        app.currentComposition = null;
        app.currentSequence = null;
        app.currentAsset = null;

        app.navigatorIsVisible = true;


        app.initialize = function (socket) {

            if (!this.device.runBrowserSupportTest()) {
                console.log('Your browser is not supported');
                return;
            }

            console.log('APPLICATION.JS::INIT');

            window.socket = this.socket = socket.connect('http://' + Config.WEBSOCKET_HOST + ':' + Config.WEBSOCKET_PORT);


            this.project = new ProjectModel();

            this.controller = Controller.init(this);

            this.router = new Router();
            this.setupBackbone();

            this.uploader = new Uploader(this.socket);
            this.settings = new Settings();
            this.initViews();


        };

        /*
         * Resize the GUI
         */
        app.resizeGUI = function () {
            var BUTTON_HEIGHT = 34,
                tHeight = this.device.height,
                headerH = Math.max(tHeight * 0.05, BUTTON_HEIGHT) | 0,
                timelineH = tHeight * 0.35 | 0,
                mainH = tHeight - headerH - timelineH | 0,
                controlH = Math.max(mainH * 0.07, BUTTON_HEIGHT) | 0,
                commandH = Math.max((mainH - controlH) * 0.07, BUTTON_HEIGHT) | 0,
                workH = mainH - controlH - commandH;

            $('header').css('height', headerH);
            //$('#projectInfo h1').css('line-height', headerH + 'px');
            $('#mainContainer').css('height', mainH);
            $('#timeline').css('height', timelineH);

            $('#navigatorControl, #stageControl').css('height', controlH);
            $('#navigatorCommands, #stageCommands').css('height', commandH);

            $('#navigator .list, #stage').css('height', workH);

            //Widths
            $('#navigator').css('width', this.getDefaultNavigatorWidth());
            $('#stageContainer').css('width', this.getDefaultStageWidth());

        };

        /*
         * These are used for toggling the navigator-Panel
         */
        app.getDefaultStageWidth = function () {
            if (app.navigatorIsVisible) {
                return this.device.width - this.getDefaultNavigatorWidth();
            }
            else {
                return '100%';
            }

        };

        app.getDefaultNavigatorWidth = function () {
            return Math.max(this.device.width * 0.25, 350) | 0;
        };


        /*
         * Configuring Backbone
         */
        app.setupBackbone = function () {

            Backbone.history.start({
                pushState : true
            });

            Backbone.setDomLibrary($);

        };

        /*
         * Initializing all Main-Views
         */
        app.initViews = function () {

            app.views.library = new LibraryListView({
                collection : app.project.get('library'),
                el         : $('#library')
            });

            app.views.compositions = new CompositionListView({
                collection : app.project.get('compositions'),
                el         : $('#compositions')
            });

            app.views.projectInfo = new ProjectInfoView({
                model : app.project,
                el    : $('#projectInfo')
            });

            //will be initialized by user-interaction in controller.js
            app.views.composition = null;
            app.views.timeline = null;

            app.views.library.render();
            app.views.projectInfo.render();

            app.views.renderAll = function () {
                console.log('APPLICATION.JS::RENDERING ALL VIEWS');
                _.each(app.views, function (obj, key) {
                    if (_.isFunction(obj)) return;
                    if (_.isObject(obj)) obj.render();
                });
            };

        };

        return app;

    })
;