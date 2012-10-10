define(["jquery", "backbone", "view/assetListView", "hbs!templates/library"],

    function ($, Backbone, AssetView, Template) {

        var LibraryView = Backbone.View.extend({

            initialize : function () {

                _.bindAll(this, 'render', 'renderAssetView', 'removeAssetView');

               //this.collection.on('analyzed', this.renderAssetView);
               //this.collection.on('add', this.renderAssetView);
               this.collection.on('change', this.renderAssetView);
               //this.collection.on('remove', this.removeAssetView);
            },

            events : {
                "click div.asset" : "assetClickHandler"
            },

            assetClickHandler : function (e) {
                var asset = this.collection.get(e.currentTarget.id);
                if (asset.hasCompatibleMedia()) {
                    app.controller.currentAsset = asset;
                }
            },

            comparator : function (asset) {
                //return asset.get("name");
            },

            renderAssetView : function (asset) {

                //progress-update does not need a whole rendering
                if (_.isObject(asset.changedAttributes())) {
                    var keys = _.keys(asset.changedAttributes());
                    if (keys.length === 1 && keys[0] == 'progress') return;
                }

                console.log('LIBRARYVIEW::renderAssetView');

                var assetView = new AssetView({model : asset, el : this.$el}),
                    $assetEl = this.$el.find('#' + asset.id);

                //hasn't been rendered before
                if (_.isEmpty($assetEl[0])) {
                    //strange bug in firefox that produces duplicates
                    $($assetEl[0]).remove();
                    this.$el.append(assetView.render());
                }
                //needs update
                else {
                    $assetEl.replaceWith(assetView.render());
                }

            },

            removeAssetView : function (asset) {
                this.$el.find('#' + asset.id).remove();
            },

            render : function () {

                if (!this.collection) return;

                console.log("LIBRARYVIEW.JS::RENDERING");

                this.$el.empty();

                _.each(this.collection.models, function (asset) {
                    this.renderAssetView(asset);
                }, this);

                return this.$el.html();
            }
        });

        return LibraryView;

    })
;