/**.
 * User: Matthieu Holzer
 * Date: 12.09.12
 * Time: 17:10
 */
define(['jquery', 'underscore', 'config', 'device', 'info', 'model/asset', 'model/file', 'model/sequence',
    'model/composition', 'view/projectBrowseView', 'view/compositionView', 'view/timelineView', 'view/compositionCreateView', 'view/sequenceCutView', 'view/projectExportView', 'view/settingsView'],
    function ($, _, Config, Device, Info, AssetModel, FileModel, SequenceModel, CompositionModel, ProjectBrowseView, CompositionView, TimelineView, CompositionCreateView, SequenceCutView, ProjectExportView, SettingsView) {

        return  {

            app : null,

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
                    if (app.currentNavigatorView === 'library') {
                        $('#fileBrowser').click();
                    }
                    else if (app.currentNavigatorView === 'compositions') {
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

                //Zoom Dropdown
                $('#stageZoom').on('change', this.stageZoomChangeHandler);

                return this;
            },

            navigatorControlClickHandler : function (e) {
                "use strict";

                $('#navigatorControl').find('li').removeClass('active');
                $(this).addClass('active');

                app.currentNavigatorView = $(this).data('nav');
                var el = $('#navigator').find('#' + app.currentNavigatorView);
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

            /**
             * De/Activates the button controls for assets/compositions
             * Gets called when an asset/composition in the library is selected by the user
             * or a selected one is removed from the library/compositions-collection
             */
            toggleListControlsAvailability : function (remove, play) {
                "use strict";
                var $remove = $('#removeButton'),
                    $play = $('#playButton');

                if (remove) $remove.removeAttr('disabled');
                else $remove.attr('disabled', 'disabled');

                if (play) $play.removeAttr('disabled');
                else $play.attr('disabled', 'disabled');
            },


            stageDropHandler : function (e, drop, drag) {

                //e.g. dragging a sequence on the stage
                if (!drag.data) return;

                var id = drag.data.id,
                    type = drag.data.type,
                    sequence;

                //Asset Drop into Composition --> Create Sequence
                if (app.currentComposition && type === 'asset') {

                    var asset = app.project.get('library').get(id),
                        sequences = app.currentComposition.get('sequences'),
                        index = sequences.length;

                    //generate new sequence and add it to current composition
                    sequence = new SequenceModel({
                            assetId       : id,
                            compositionId : app.currentComposition.id,
                            name          : asset.get('name'),
                            type          : asset.get('type'),
                            duration      : asset.get('duration'),
                            width         : asset.get('width'),
                            height        : asset.get('height'),
                            stack         : index,
                            fps           : asset.get('fps'),
                            position      : 0
                        }
                    );

                    sequence.save(null, {success : function () {
                        sequences.add(sequence);
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
                        self.openComposition();
                    }
                }

                //Composition Drop --> Open it
                else if (!app.currentComposition && type === 'composition') {
                    app.currentComposition = app.project.get('compositions').get(id);
                    self.openComposition();
                }

                //TODO effect
                //else if{}


            },

            showDialogue : function (dialogueViewName, cancellable) {
                "use strict";

                //default
                var cancelOption = cancellable === undefined ? true : cancellable,
                    $dialogue = $('#dialogue').css('top', ''); //reveal sets top inline

                //create dialogue-DIV and append it if needed
                if ($dialogue.length < 1) {
                    $('body').append('<div id="dialogue" class="reveal-modal"></div>');
                    $dialogue = $('#dialogue');
                }

                //always reset to default
                $dialogue.removeClass('fullscreen').addClass('standard');

                switch (dialogueViewName) {

                    case 'compositionCreate' :
                        app.currentDialogue = new CompositionCreateView({
                            el        : $dialogue,
                            model     : new CompositionModel(),
                            projectId : app.project.id
                        });
                        break;

                    case 'sequenceCut' :
                        app.currentDialogue = new SequenceCutView({
                            el          : $dialogue,
                            model       : app.views.timeline.currentSequence.model,
                            cuttingMode : true
                        });
                        $dialogue.addClass('fullscreen').removeClass('standard');
                        break;

                    case 'assetPreview' :
                        break;

                    case 'projectBrowser' :
                        app.currentDialogue = new ProjectBrowseView({
                            el    : $dialogue,
                            model : app.project
                        });
                        app.currentDialogue.cancellable = cancelOption;
                        break;

                    case 'exportProject' :
                        app.currentDialogue = new ProjectExportView({
                            el    : $dialogue,
                            model : app.project
                        });
                        break;

                    case 'settings' :
                        app.currentDialogue = new SettingsView({
                            el    : $dialogue,
                            model : app.settings
                        });
                        break;
                }

                if (app.currentDialogue) {
                    app.currentDialogue.render();
                    Info.reveal($dialogue, {closeonbackgroundclick : cancelOption});
                }


            },


            uploadInputChangeHandler : function (e) {
                for (var i = 0; i < e.target.files.length; i++) {
                    self.createFileAssetRelation(e.target.files[i]);
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
                var asset = new AssetModel();

                asset.save(null, {'success' : function () {

                    app.project.get('library').add(asset);

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
                        asset.getInfoFromOriginalFile();
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

            stageZoomChangeHandler : function () {
                "use strict";
                if (!app.views.composition) return;
                app.views.composition.scale(parseFloat($(this).val()));
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
                    case 'shareProject' :
                        self.showDialogue('exportProject', true);
                        break;
                    case 'settings' :
                        self.showDialogue('settings', true);
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

                    case    'removeButton' :
                        if (app.currentNavigatorView === 'library' && app.views.library.currentAsset) {
                            app.views.library.currentAsset.destroy();
                            app.views.library.currentAsset = null;
                        }
                        else if (app.currentNavigatorView === 'compositions' && app.views.compositions.currentComposition) {
                            app.views.compositions.currentComposition.destroy();
                            app.views.compositions.currentComposition = null;
                        }

                }

            }

        }
            ;


    })
;
