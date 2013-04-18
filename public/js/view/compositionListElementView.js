define(['jquery', 'underscore', 'backbone', 'utils', 'hbs!templates/compositionListElement'],

    function ($, _, Backbone, Utils, Template) {
        'use strict';

        return Backbone.View.extend({

            tagName   : 'div',
            className : 'composition',

            events : {
                'click button' : 'buttonClickHandler'
            },

            initialize : function () {
                _.bindAll(this, 'update');
                this.model.on('change:progress', this.update);
            },

            buttonClickHandler : function (e) {
                var cmd = ($(e.target).attr('data-cmd'));

                switch (cmd) {
                    case 'encode' :
                        this.model.sendEncodingRequest();
                        break;
                    case 'download' :
                        this.getDownloadFile();
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

            },

            update : function () {
                if (this.model.hasChanged('progress')) {
                    this.$('progress').val(this.model.get('progress'));
                }
            },

            getDownloadFile : function () {

                var url = [];
                url.push('/projects/');
                url.push(app.project.get('assetFolder'));
                url.push('/compositions/');
                url.push(this.model.id);

                //no need for file extension
                window.location.href = url.join('');
            }

        });


    }
)
;