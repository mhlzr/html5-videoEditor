define(["jquery", "backbone", "view/assetView", "hbs!templates/library"],

    function ($, Backbone, AssetView, Template) {

        var LibraryView = Backbone.View.extend({

            initialize : function () {
                _.bindAll(this, 'render', 'renderAssetView', 'removeAssetView');
                this.collection.on('add', this.renderAssetView);
                this.collection.on('remove', this.removeAssetView);
            },

            events : {
                "click div.asset" : "assetClickHandler"
            },

            assetClickHandler : function (e) {
                console.log(this.collection.get(e.currentTarget.id).getCompatibleMedia());
            },

            comparator : function (asset) {
                //return asset.get("name");
            },

            renderAssetView : function (asset) {

                var assetView = new AssetView({model : asset}),
                    $assetEl = this.$el.find('#' + asset.id);

                //hasn't been rendered before
                if (_.isEmpty($assetEl[0])) {
                    this.$el.append(assetView.render());
                }
                //needs update
                else {
                    $assetEl.replaceWith(assetView.render());
                }

                asset.on('change', this.renderAssetView);

            },

            removeAssetView  : function (asset) {
                this.$el.find('#' + asset.id).remove();
            },

            //there is no need to re-render everytime
            setAssetProgress : function (assetId, value) {
                this.$el.find('#' + assetId + ' progress').attr('value', value)
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