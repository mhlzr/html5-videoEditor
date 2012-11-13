define(['jquery', 'backbone', 'hbs!templates/assetListElement'],
    function ($, Backbone, Template) {
        'use strict';

        return Backbone.View.extend({

            tagName   : 'div',
            className : 'asset',

            initialize : function () {
                _.bindAll(this, 'progressChangeHandler');
                this.model.on('change:progress', this.progressChangeHandler);
            },

            render : function () {

                if (!this.model) return null;

                return Template(this.model.toJSON());

            },

            progressChangeHandler : function () {
                //actually this view has no real $el, its the $el of libraryView, fuck me, right? ;)
                this.$el
                    .find('#' + this.model.id + ' progress')
                    .val(this.model.get('progress'));

                //force rerendering for webkit browsers
                //http://stackoverflow.com/questions/3485365/
                this.$el[0].style.display = 'none';
                this.$el[0].offsetHeight;
                this.$el[0].style.display = 'block';
            }
        });


    }
)
;