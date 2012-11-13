/**.
 * User: Matthieu Holzer
 * Date: 12.09.12
 * Time: 17:10
 */
define(['jquery', 'underscore', 'config', 'info', 'model/asset', 'model/file', 'model/sequence',
    'model/composition', 'view/compositionView', 'view/timelineView', 'qrcode'],
    function ($, _, Config, Info, AssetModel, FileModel, SequenceModel, CompositionModel, CompositionView, TimelineView) {

        return  {

            app                  : null,
            currentNavigatorView : 'library',

            init : function (app) {
                this.app = app;
                self = this;
                this.addListeners();
                this.onWindowResize();
                return this;
            },

            addListeners : function () {
                "use strict";

                $(window).on('resize', this.onWindowResize);

                if (!Config.DEBUG) {
                    window.onbeforeunload = this.windowEventHandler;
                    window.onunload = this.windowEventHandler;
                }

                if (app.device.isMobile) {
                    window.addEventListener('orientationchange', this.deviceOrientationChangeHandler, false);
                }

                $('#addButton').on('click', function () {
                    if (self.currentNavigatorView === 'library') {
                        $('#fileBrowser').click();
                    }
                    else if (self.currentNavigatorView === 'compositions') {
                        Info.reveal($('#compositionDialogue'));
                    }

                });

                $('#fileBrowser').on('change', this.uploadInputChangeHandler);
                $('button, a').on('click', this.buttonHandler);

                //Drag And Drop Events
                //native Drop-Event for File-Drops
                $('#library').on('drop', this.libraryFileDropHandler);
                //jquery++ dnd events
                $('#stage').on('dropon', this.stageDropHandler);

                $('#navigatorControl li').on('click', this.navigatorControlClickHandler);

                //Dialog-Buttons
                $('#createCompositionBtn').on('click', this.createComposition);

                return this;
            },

            navigatorControlClickHandler : function (e) {
                "use strict";

                $('#navigatorControl').find('li').removeClass('active');
                $(this).addClass('active');

                self.currentNavigatorView = $(this).data('nav');
                var el = $('#navigator').find('#' + self.currentNavigatorView);
                $('#navigator .list').hide();
                el.show();
            },

            onWindowResize : function () {
                app.device.setWindowDimensions($(window).width(), $(window).height());
                app.resizeGUI();
            },

            windowEventHandler : function (e) {

                if (e.type === 'beforeunload' || e.type === 'unload') {
                    app.project.save();
                    return 'There are still some uploads pending ...';
                }

                else return null;

            },

            libraryFileDropHandler : function (e) {
                "use strict";

                e.stopPropagation();
                e.preventDefault();

                var files = e.originalEvent.dataTransfer.files;
                _.each(files, function (file) {
                    app.controller.createFileAssetRelation(file);
                })

            },


            stageDropHandler : function (e, drop, drag) {


                var id = drag.data.id,
                    type = drag.data.type,
                    sequence;

                console.log(id, type);

                //Asset Drop into Composition --> Create Sequence
                if (app.currentComposition && type === 'asset') {

                    //generate new sequence and add it to current composition
                    sequence = new SequenceModel({
                        assetId  : id,
                        name     : app.project.get('library').get(id).get('name'),
                        type     : app.project.get('library').get(id).get('type'),
                        duration : app.project.get('library').get(id).get('duration'),
                        position : Math.random() * 300 | 0 //debugging
                    });

                    sequence.save(null, {success : function () {
                        app.currentComposition.get('sequences').add(sequence);
                    }});

                }

                //Asset drop into nirvana --> Message
                else if (!app.currentComposition && type === 'asset') {
                    if (window.confirm('You need to create or select a composition first. \nDo you want to create one right now?')) {
                        Info.reveal($('#compositionDialogue'));
                    }
                }
                //Composition Drop into Composition --> Message
                else if (app.currentComposition && type === 'composition') {
                    if (window.confirm('You can\'t nest compositions. \nDo you want to open the composition you dragged?')) {
                        app.currentComposition = app.project.get('compositions').get(id);
                        app.controller.openComposition();
                    }
                }

                //Composition Drop --> Open it
                else if (!app.currentComposition && type === 'composition') {
                    app.currentComposition = app.project.get('compositions').get(id);
                    app.controller.openComposition();
                }

                //TODO effect
                else {
                    console.log('NOTHING');
                }

            },


            uploadInputChangeHandler : function (e) {

                for (var i = 0; i < e.target.files.length; i++) {
                    app.controller.createFileAssetRelation(e.target.files[i]);
                }

            },

            createComposition : function (e) {

                //Close Reveal Modal
                $(this).trigger('reveal:close');
                var durationInSecs = parseInt($('#compositionDurationHour').val(), 10) * 60 * 60 + parseInt($('#compositionDurationMin').val(), 10) * 60 + parseInt($('#compositionDurationSec').val(), 10),
                    composition = new CompositionModel(
                        {
                            'projectId' : app.project.id,
                            'name'      : $('#compositionName').val(),
                            'fps'       : $('#compositionFps').val(),
                            'height'    : $('#compositionHeight').val(),
                            'width'     : $('#compositionWidth').val(),
                            'duration'  : durationInSecs
                        });

                composition.save(null, {'success' : function () {
                    composition.initServerUpdateListener();
                    //update view manually
                    app.views.compositions.render();
                }});


            },

            openComposition : function () {
                "use strict";

                app.views.composition = new CompositionView({
                    model : app.currentComposition,
                    el    : $('#stage')
                });

                app.views.timeline = new TimelineView({
                    model : app.currentComposition,
                    el    : $('#timeline')
                });

                app.views.timeline.render();
                app.views.composition.render();


            },

            createFileAssetRelation : function (fileObject) {

                //quite complicated but the only solution i found
                var asset = new AssetModel({
                    'projectId' : app.project.id
                });

                asset.save(null, {'success' : function () {

                    asset.initServerUpdateListener();

                    var file = new FileModel({
                        'localFile'        : fileObject,
                        'isComplete'       : false,
                        'isOriginal'       : true,
                        'encodingProgress' : 100,
                        'assetId'          : asset.id
                    });

                    file.save(null, {success : function () {
                        file.initServerUpdateListener();
                        asset.save(null, {success : asset.analyze()});
                    }});
                }});

            },

            toggleNavigator : function () {
                "use strict";
                if (app.navigatorIsVisible) self.hideNavigator();
                else self.showNavigator();
            },

            showNavigator : function () {
                "use strict";
                app.navigatorIsVisible = true;
                $('#navigator').css('display', 'block');
                $('#stageContainer').css('width', app.getDefaultStageWidth());
                $('#toggleNavigator').removeClass('right').addClass('left');
            },

            hideNavigator : function () {
                "use strict";
                app.navigatorIsVisible = false;
                $('#navigator').css('display', 'none');
                $('#stageContainer').css('width', '100%');
                $('#toggleNavigator').removeClass('left').addClass('right');
            },

            deviceOrientationChangeHandler : function (e) {
                "use strict";
                if (app.settings.get('autoHideNavigatorOnRotate')) {
                    //portrait-mode
                    if (window.orientation % 90 != 0) {
                        self.hideNavigator();
                    }
                    //landscape-mode
                    else {
                        self.toggleNavigator(false);
                    }
                }
            },

            buttonHandler : function (e) {

                var project = app.project;

                switch (e.target.id) {

                    case 'dumpProject' :
                        console.log('P', project.toJSON(), 'L', project.get('library').toJSON(), 'C', project.get('compositions').toJSON());
                        break;
                    case 'saveLocalBtn':

                        $.jStorage.set(project.id, {
                            name : project.get('name'),
                            date : project.get('date')
                        });
                        break;

                    case 'fetchBtn':
                        project.fetch();
                        break;

                    case 'render' :
                        app.views.renderAll();
                        break;
                    case 'clearLocalBtn':
                        $.jStorage.flush();
                        break;
                    case 'saveBtn':
                        project.save({}, {'success' : function onSuccess() {
                            app.router.navigate('' + app.project.id, {trigger : true, replace : true});
                        }});

                        break;
                    case 'deleteBtn':
                        project.destroy();
                        break;
                    case 'addSequenceToCompBtn':
                        console.log('ADDING SEQUENCE');
                        project.get('compositions').add(new SequenceModel());
                        break;

                    case 'share' :
                        Info.reveal($('#exportDialogue'));
                        $('#qrcode').empty().qrcode(window.location.href);
                        break;
                    case 'startBtn'  :
                        app.uploader.start();
                        break;
                    case 'stopBtn' :
                        app.uploader.stop();
                        break;

                    case 'toggleNavigator' :
                        self.toggleNavigator();
                        break;

                }

            }

        }
            ;


    })
;
