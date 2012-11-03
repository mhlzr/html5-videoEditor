define(['jquery', 'backbone', 'hbs!templates/compositionListElement'],
    function ($, Backbone, Template) {
        'use strict';

        return Backbone.View.extend({

            tagName   : 'div',
            className : 'composition',

            initialize : function () {
                //this.model.on('change:progress', this.progressChangeHandler);
            },

            render : function () {

                if (!this.model) return null;

                return Template(this.model.toJSON());

            }

        });


    }
)
;