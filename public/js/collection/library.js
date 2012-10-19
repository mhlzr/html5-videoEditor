define(["backbone", "model/asset"],

    function (Backbone, AssetModel) {

        return Backbone.Collection.extend({

            model : AssetModel,
            url   : 'library',

            initialize : function () {
                console.log('LIBRARY.JS::INIT');

                _.bindAll(this, 'onAssetAnalyzed', 'sendAssetToUploader');

                this.on('analyzed', this.onAssetAnalyzed);
            },


            onAssetAnalyzed : function (asset) {
                console.log('LIBRARY.JS::ASSET_ANALYZED', asset.id);
                if (!asset.getOriginalFile().get('isComplete')) {
                    this.sendAssetToUploader(asset);
                }
            },

            sendAssetToUploader : function (asset) {
                var file = asset.getOriginalFile();

                app.uploader.addFile(
                    app.project.id,
                    asset.id,
                    file.id,
                    file.get('localFile'),
                    file.get('byteOffset')
                );

                app.uploader.start();

            }

        });

    });