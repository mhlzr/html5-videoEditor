define(["backbone", "model/asset"],

    function (Backbone, AssetModel) {

        var Library = Backbone.Collection.extend({

            model : AssetModel,

            initialize : function () {
                console.log('LIBRARY.JS::INIT');

                _.bindAll(this, 'changeHandler', 'onAssetAddHandler', 'onAssetAnalyzed');

                this.on('change', this.changeHandler);
                this.on('add', this.onAssetAddHandler);
                this.on('analyzed', this.onAssetAnalyzed);
            },

            onAssetAddHandler : function (asset) {
                console.log('LIBRARY.JS::ASSET_ADDED', asset.get('id'));
                asset.analyze();
            },

            onAssetAnalyzed : function (asset) {
                console.log('LIBRARY.JS::ASSET_ANALYZED', asset.get('id'));
                app.uploader.addFile(asset.get('id'), asset.get('files').at(0).get('localFile'), app.project.get("_id"), 0);
                app.uploader.start();
            },

            changeHandler : function () {
                //console.log('LIBRARY.JS::CHANGE');
            },

            getNewestAsset : function (e) {
                return this.at(this.length - 1);
            }

        });

        return Library;

    })
;