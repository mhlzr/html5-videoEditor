/**.
 * User: Matthieu Holzer
 * Date: 12.09.12
 * Time: 17:10
 */
define(['jquery', 'underscore', 'config', 'device', 'info', 'model/asset', 'model/file', 'model/sequence',
    'model/composition', 'view/projectBrowseView', 'view/compositionView', 'view/timelineView', 'view/compositionCreateView', 'view/sequenceCutView', 'qrcode'],
    function ($, _, Config, Device, Info, AssetModel, FileModel, SequenceModel, CompositionModel, ProjectBrowseView, CompositionView, TimelineView, CompositionCreateView, SequenceCutView) {

        return  {

            app                  : null,
            currentNavigatorView : 'library',
            currentDialogue      : null,

            init : function (app) {
                this.app = app;
                self = this;
                this.addListeners();
                this.onWindowResize();

                //detect if device supports fullscreen,
                //if so enable the button
                if (Device.hasFullScreenSupport) {
                    $('#toggleFullscreen').removeAttr('disabled');
                }

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
                        self.showDialogue('compositionCreate');
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

                //e.g. dragging a sequence on the stage
                if (!drag.data) return;

                var id = drag.data.id,
                    type = drag.data.type,
                    sequence;

                //Asset Drop into Composition --> Create Sequence
                if (app.currentComposition && type === 'asset') {

                    var asset = app.project.get('library').get(id);
                    //generate new sequence and add it to current composition
                    sequence = new SequenceModel({
                            assetId       : id,
                            compositionId : app.currentComposition.id,
                            name          : asset.get('name'),
                            type          : asset.get('type'),
                            duration      : asset.get('duration'),
                            width         : asset.get('width'),
                            height        : asset.get('height'),
                            position      : 0
                        }
                    )
                    ;

                    sequence.save(null, {success : function () {
                        app.currentComposition.get('sequences').add(sequence);
                    }});

                }

                //Asset drop into nirvana --> Message
                else if (!app.currentComposition && type === 'asset') {
                    if (window.confirm('You need to create or select a composition first. \nDo you want to create one right now?')) {
                        self.showDialogue('compositionCreate');
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

            showDialogue : function (dialogueViewName, cancellable) {
                "use strict";

                //default
                var cancelOption = cancellable === undefined ? true : cancellable;

                //create dialogue-DIV and append it
                $('body').append('<div id="dialogue" class="reveal-modal"></div>');

                var $dialogue = $('#dialogue');

                switch (dialogueViewName) {

                    case 'compositionCreate' :
                        self.currentDialogue = new CompositionCreateView({
                            el        : $dialogue,
                            model     : new CompositionModel(),
                            projectId : app.project.id
                        });
                        break;

                    case 'sequenceCut' :
                        self.currentDialogue = new SequenceCutView({
                            el          : $dialogue,
                            model       : app.currentSequence.model,
                            cuttingMode : true
                        });
                        break;

                    case 'projectBrowser' :
                        self.currentDialogue = new ProjectBrowseView({
                            el    : $dialogue,
                            model : app.project
                        });
                        self.currentDialogue.cancellable = cancelOption;
                }

                if (self.currentDialogue) {
                    self.currentDialogue.render();
                    Info.reveal($dialogue, {closeonbackgroundclick : cancelOption});
                }


            },


            uploadInputChangeHandler : function (e) {

                for (var i = 0; i < e.target.files.length; i++) {
                    app.controller.createFileAssetRelation(e.target.files[i]);
                }

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

                //highlight current composition in the navigator-View
                app.views.compositions.highlight(app.currentComposition.id);

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

                switch (e.target.id) {
                    case 'projectBrowser' :
                        self.showDialogue('projectBrowser', true);
                        break;
                    case 'togglePlayPauseComposition' :
                        if (app.views.composition) {
                            app.views.composition.togglePlayPause();
                            app.views.timeline.togglePlayPause();
                            $(this).toggleClass('pause play');
                        }
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

                    case 'toggleFullscreen' :
                        if (Device.hasFullScreenSupport) {
                            Device.toggleFullscreen();
                        }
                        break;
                }

            }

        }
            ;


    })
;
