define(['jquery', 'underscore', 'backbone', 'utils', 'hbs!templates/compositionListElement'],

    function ($, _, Backbone, Utils, Template) {
        'use strict';

        return Backbone.View.extend({

            tagName   : 'div',
            className : 'composition',

            render : function () {

                return Template(_.extend(this.model.toJSON(), {
                    "timecode" : Utils.getCleanTimeCode(this.model.get('duration'), this.model.get('fps'))
                }));

            }

        });


    }
)
;