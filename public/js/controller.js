/**.
 * User: Matthieu Holzer
 * Date: 12.09.12
 * Time: 17:10
 */
define(['jquery', 'config', 'info', 'model/asset', 'model/file', 'qrcode'], function ($, Config, Info, AssetModel, FileModel) {

    return  {

        app : null,

        init : function (app) {
            this.app = app;
            this.addListeners();
            return this;
        },

        addListeners : function () {

            $(window).on('resize', this.onWindowResize);

            if (!Config.DEBUG) {
                window.onbeforeunload = this.windowEventHandler;
                window.onunload = this.windowEventHandler;
            }

            $('#fileBrowserButton').on('click', function () {
                $('#fileBrowser').click();
            });

            $('#fileBrowser').on('change', this.uploadInputChangeHandler);
            $('button').on('click', this.buttonHandler);

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


        uploadInputChangeHandler : function (e) {

            for (var i = 0; i < e.target.files.length; i++) {
                app.controller.createFileAssetRelation(e.target.files[i]);
            }

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

                console.log(file.get('assetId'));

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
                    console.log(project.toJSON(), project.get('library').toJSON());
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
                case 'sync':
                    Backbone.sync;
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
