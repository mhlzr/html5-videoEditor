define([
    'config', 'jquery', 'jstorage', 'backbone', 'modernizr', 'socket', 'router',
    'controller', 'model/settings', 'modules/device', 'modules/uploader.socket', 'info',
    'model/project',
    'view/libraryListView', 'view/compositionListView', 'view/projectInfoView',
    'backbone-bind', 'backbone-sync'],

    function (Config, $, jStorage, Backbone, Modernizr, Socket, Router, Controller, Settings, Device, Uploader, Info, ProjectModel, LibraryListView, CompositionListView, ProjectInfoView) {

        'use strict';

        var app = {};

        app.device = Device;
        app.info = Info;
        app.uploader = null;

        app.project = app.project || {};

        app.views = {};
        app.controller = null;
        app.socket = null;

        app.initialize = function (socket) {

            if (!this.device.runBrowserSupportTest()) {
                console.log('Your browser is not supported');
                return;
            }

            console.log('APPLICATION.JS::INIT');

            window.socket = this.socket = socket.connect('http://' + Config.WEBSOCKET_HOST + ':' + Config.WEBSOCKET_PORT);


            this.project = new ProjectModel();

            this.router = new Router();
            this.setupBackbone();

            this.uploader = new Uploader(this.socket);

            //this.info.noty({text : 'noty - a jquery notification library!' });
            //this.info.reveal($('#dialogueTest'));

            this.initViews();

            this.getAvailableProjectsFromLocalStorage();

            this.controller = Controller.init(this);
            this.settings = new Settings();

        };

        /*
         * Resize the GUI
         */
        app.resizeGUI = function () {
            var BUTTON_HEIGHT = 34,
                tHeight = this.device.height,
                tWidth = this.device.width,
                headerH = Math.max(tHeight * 0.05, BUTTON_HEIGHT) | 0,
                timelineH = tHeight * 0.25 | 0,
                mainH = tHeight - headerH - timelineH | 0,
                controlH = Math.max(mainH * 0.07, BUTTON_HEIGHT) | 0,
                commandH = Math.max((mainH - controlH) * 0.07, BUTTON_HEIGHT) | 0,
                workH = mainH - controlH - commandH,
                navigatorW = Math.max(tWidth * 0.25, 350) | 0,
                stageContainerW = tWidth - navigatorW;

            $('header').css('height', headerH);
            $('#mainContainer').css('height', mainH);
            $('#timeline').css('height', timelineH);

            $('#navigatorControl, #stageControl').css('height', controlH);
            $('#navigatorCommands, #stageCommands').css('height', commandH);

            $('#navigator .list, #stage').css('height', workH);

            $('#navigator').css('width', navigatorW);
            $('#stageContainer').css('width', stageContainerW);

        };

        /*
         * Configuring Backbone
         */
        app.setupBackbone = function () {

            Backbone.history.start({
                pushState:true
            });

            Backbone.setDomLibrary($);

        };

        /*
         * Initializing all Main-Views
         */
        app.initViews = function () {

            app.views.library = new LibraryListView({
                collection:app.project.get('library'),
                el:$('#library')
            });

            app.views.compositions = new CompositionListView({
                collection:app.project.get('compositions'),
                el:$('#compositions')
            });

            app.views.projectInfo = new ProjectInfoView({
                model:app.project,
                el:$('#projectInfo')
            });

            app.views.library.render();
            //app.views.compositions.render();
            app.views.projectInfo.render();

            app.views.renderAll = function () {
                console.log('APPLICATION.JS::RENDERING ALL VIEWS');
                _.each(app.views, function (obj, key) {
                    if (_.isFunction(obj)) return;
                    if (_.isObject(obj)) obj.render();
                });
            };

        };

        app.getAvailableProjectsFromLocalStorage = function () {
            var localProjects = $.jStorage.index(),
                outputList = $('#availableProjects');

            var currentProj;

            for (var i = 0; i < localProjects.length; i++) {
                currentProj = $.jStorage.get(localProjects[i]);

            }
        };

        return app;

    });