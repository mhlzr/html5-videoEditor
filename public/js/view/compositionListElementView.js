define(['jquery', 'underscore', 'backbone', 'utils', 'hbs!templates/compositionListElement'],

    function ($, _, Backbone, Utils, Template) {
        'use strict';

        return Backbone.View.extend({

            tagName   : 'div',
            className : 'composition',

            events : {
                'click button' : 'buttonClickHandler'
            },

            buttonClickHandler : function (e) {
                var cmd = ($(e.target).attr('data-cmd'));

                switch (cmd) {
                    case 'encode' :
                        this.model.sendEncodingRequest();
                        break;
                    default:
                        break;
                    //TODO other cases
                }
            },

            render : function () {

                return Template(_.extend(this.model.toJSON(), {
                    "timecode" : Utils.getCleanTimeCode(this.model.get('duration'), this.model.get('fps'))
                }));

            }

        });


    }
)
;