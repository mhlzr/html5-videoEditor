/**.
 * User: Matthieu Holzer
 * Date: 12.09.12
 * Time: 17:10
 */
define(['jquery', 'underscore', 'config', 'info', 'model/asset', 'model/file', 'model/sequence', 'model/composition', 'qrcode'], function ($, _, Config, Info, AssetModel, FileModel, SequenceModel, CompositionModel) {

    return  {

        app                  : null,
        currentComposition   : null,
        currentNavigatorView : 'library',

        init : function (app) {
            this.app = app;
            self = this;
            this.addListeners();
            return this;
        },

        addListeners : function () {

            $(window).on('resize', this.onWindowResize);

            if (!Config.DEBUG) {
                window.onbeforeunload = this.windowEventHandler;
                window.onunload = this.windowEventHandler;
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
            $('#library').on('dragover drop', this.libraryFileDragHandler);
            $('#stage').on('dragover drop', this.stageFileDropHandler);

            $('#navigatorControl li').on('click', this.navigatorControlClickHandler);

            //Dialog-Buttons
            $('#createCompositionBtn').on('click', this.createComposition);

            return this;
        },

        navigatorControlClickHandler : function (e) {
            self.currentNavigatorView = $(this).data('nav');
            var el = $('#navigator').find('#' + self.currentNavigatorView);
            $('#navigator .list').hide();
            el.show();
        },

        onWindowResize : function () {
            app.device.setWindowDimensions($(window).width(), $(window).height());
        },

        windowEventHandler : function (e) {

            if (e.type === 'beforeunload' || e.type === 'unload') {
                app.project.save();
                return 'There are still some uploads pending ...';
            }

            else return null;

        },

        libraryFileDragHandler : function (e) {
            e.stopPropagation();
            e.preventDefault();

            if (e.type === 'dragover') return;

            var files = e.originalEvent.dataTransfer.files;
            _.each(files, function (file) {
                app.controller.createFileAssetRelation(file);
            })

        },


        stageFileDropHandler : function (e) {
            e.stopPropagation();
            e.preventDefault();

            if (e.type === 'dragover') return;

            var id = e.originalEvent.dataTransfer.getData('id'),
                type = e.originalEvent.dataTransfer.getData('type'),
                sequence;

            if (self.currentComposition) {
                //generate new sequence and add it to current composition if existent
                sequence = new SequenceModel({
                    assetId : id
                });

                console.log(id, type, sequence.toJSON());
                sequence.save();
            }

            else {
                if(window.confirm('You need to create a composition first. \nDo you want to do that right now?')){
                    Info.reveal($('#compositionDialogue'));
                }
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

        buttonHandler : function (e) {

            var project = app.project;

            switch (e.target.id) {

                case 'dumpProject' :
                    console.log(project.toJSON(), project.get('library').toJSON(), project.get('compositions').toJSON());
                    console.log(project.get('library').at(0).get('files').toJSON());
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

            }

        }

    }
        ;


})
;
