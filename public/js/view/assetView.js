define(["jquery", "backbone", "hbs!templates/asset"],
    function ($, Backbone, Template) {

        var AssetView = Backbone.View.extend({

            tagName   : 'div',
            className : 'asset',

            initialize : function () {
                _.bindAll(this, 'progressChangeHandler');
                this.model.on('change:progress', this.progressChangeHandler);
            },

            render : function () {

                if (!this.model) return;

                return Template(this.model.toJSON());

            },

            progressChangeHandler : function () {
                //actually this view has no real $el, its the $el of libraryView, fuck me, right? ;)
                this.$el.find('#' + this.model.get('id') + ' progress').val(this.model.get('progress'));
            }
        });

        return AssetView;

    }
)
;