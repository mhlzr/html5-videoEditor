define(["jquery", "backbone", "hbs!templates/asset"],
    function ($, Backbone, Template) {

        var AssetView = Backbone.View.extend({

            tagName    : 'div',
            className  : 'asset',

            initialize : function () {
            },

            render : function () {

                if (!this.model) return;

                return Template(this.model.toJSON());

            }
        });

        return AssetView;

    }
)
;