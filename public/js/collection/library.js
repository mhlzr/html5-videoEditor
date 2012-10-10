define(["backbone", "model/asset"],

    function (Backbone, AssetModel) {

        var Library = Backbone.Collection.extend({

            model : AssetModel,

            url : 'library',

            initialize : function () {
                console.log('LIBRARY.JS::INIT');

                _.bindAll(this, 'changeHandler', 'onAssetAnalyzed', 'sendAssetToUploader');

                // this.on('change', this.changeHandler);
                this.on('analyzed', this.onAssetAnalyzed);
            },

            onAssetAnalyzed : function (asset) {
                console.log('LIBRARY.JS::ASSET_ANALYZED', asset.id);
                if (!asset.getOriginalFile().get('isComplete')) {
                    this.sendAssetToUploader(asset);
                }
            },

            changeHandler : function () {
                //console.log('LIBRARY.JS::CHANGE');
            },

            sendAssetToUploader : function (asset) {
                var file = asset.getOriginalFile();

                app.uploader.addFile(
                    app.project.id,
                    asset.id,
                    file.id,
                    file.get('localFile'),
                    file.get('transmittedBytes')
                );

                app.uploader.start();

            }

        });

        return Library;

    })
;