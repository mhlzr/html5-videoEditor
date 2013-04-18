define(['jquery', 'underscore', 'backbone', 'view/assetListElementView', 'jquery++'],

    function ($, _, Backbone, AssetView) {

        return Backbone.View.extend({

                currentAsset : null,

                initialize : function () {

                    _.bindAll(this, 'render', 'renderAssetView', 'removeAssetView', 'assetDoubleClickHandler', 'assetDragStartHandler');

                    this.collection.on('analyzed', this.renderAssetView);
                    this.collection.on('add', this.renderAssetView);
                    this.collection.on('change', this.renderAssetView);
                    this.collection.on('remove', this.removeAssetView);
                },

                events : {
                    'click div.asset'                   : 'assetClickHandler',
                    'dblclick div.asset:not(.disabled)' : 'assetDoubleClickHandler',
                    'draginit div.asset:not(.disabled)' : 'assetDragStartHandler'
                },

                assetClickHandler : function (e) {
                    "use strict";

                    var $target = $(e.currentTarget),
                        id = $target[0].id;

                    this.currentAsset = this.collection.get(id);

                    //highlight
                    $('.asset').removeClass('active');
                    $target.addClass('active');

                    //enable controls, depending on asset status
                    app.controller.toggleListControlsAvailability(true, this.currentAsset.hasCompatibleMedia());
                },

                assetDoubleClickHandler : function (e) {

                    var asset = this.collection.get(e.currentTarget.id);

                    //TODO open preview on dblclick
                    /*
                     if (asset.hasCompatibleMedia()) {
                     console.log(asset.getCompatibleMedia());
                     app.controller.currentAsset = asset;
                     }
                     */
                },

                assetDragStartHandler : function (e, drag) {
                    'use strict';

                    //don't know how to deactivate the jquery++-delegation,
                    //so had to do this workaround to get the target-id
                    var el = e.originalEvent.target;

                    while (!$(el).hasClass('asset')) {
                        el = el.parentElement;
                    }

                    drag.data = {'type' : 'asset', 'id' : el.id};
                    drag.ghost();
                },

                renderAssetView : function (asset) {

                    //without an id the asset shouldn't be rendered
                    if (!asset.id) return;

                    //progress-update does not need a whole rendering
                    if (_.isObject(asset.changedAttributes())) {
                        var keys = _.keys(asset.changedAttributes());
                        if (keys.length === 1 && keys[0] == 'progress') {
                            return;
                        }
                    }

                    var assetView = new AssetView({model : asset, el : this.$el}),
                        $assetEl = this.$el.find('#' + asset.id);

                    //hasn't been rendered before
                    if (_.isEmpty($assetEl[0])) {
                        //strange bug in firefox that produces duplicates
                        //$($assetEl[0]).remove();
                        this.$el.append(assetView.render());
                        this.testAssetActivationStatus(asset);
                    }
                    //needs update
                    else {
                        $assetEl.replaceWith(assetView.render());
                        this.testAssetActivationStatus(asset);
                    }
                },

                testAssetActivationStatus : function (asset) {
                    "use strict";
                    var $assetEl = this.$el.find('#' + asset.id);
                    if (asset.hasCompatibleMedia()) $assetEl.removeClass('disabled');
                    else {
                        $assetEl.addClass('disabled');
                    }
                },

                removeAssetView : function (asset) {
                    this.$el.find('#' + asset.id).remove();
                },

                render : function () {

                    if (!this.collection) return null;

                    this.$el.empty();

                    _.each(this.collection.models, function (asset) {
                        this.renderAssetView(asset);
                    }, this);

                    return this.$el.html();
                }
            }
        )
            ;


    })
;