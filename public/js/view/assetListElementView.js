define(['jquery', 'underscore', 'backbone', 'hbs!templates/assetListElement', 'utils'],
    function ($, _, Backbone, Template, Utils) {
        'use strict';

        return Backbone.View.extend({

            tagName   : 'div',
            className : 'asset',

            initialize : function () {
                _.bindAll(this, 'progressChangeHandler', 'fileCompletionHandler');

                this.model.on('change:progress', this.progressChangeHandler);
                this.model.get('files').on('change:isComplete', this.fileCompletionHandler);
            },

            render : function () {

                if (!this.model) return null;


                var extensions = [],
                    timecode;

                //view needs to know which file-types are active
                this.model.get('files').each(function (file) {
                    if (file.get('isComplete') && file.get('ext'))
                        extensions.push(file.get('ext'));
                });

                //timecode
                if (this.model.get('fps') > 0) {
                    timecode = Utils.getCleanTimeCode(this.model.get('duration'), this.model.get('fps'), true);
                }
                else {
                    timecode = this.model.get('duration') + 's';
                }

                return Template(_.extend(this.model.toJSON(), {
                    extensions : extensions,
                    timecode   : timecode
                }));

            },

            progressChangeHandler : function () {
                //actually this view has no real $el, its the $el of libraryView, fuck me, right? ;)
                $('#' + this.model.id + ' progress').val(this.model.get('progress'));

                //force rerendering for webkit browsers
                //http://stackoverflow.com/questions/3485365/
                //only rerender, when the library-navigator is visible
                if (app.navigatorIsVisible && app.currentNavigatorView === 'library') {
                    this.$el[0].style.display = 'none';
                    this.$el[0].offsetHeight;
                    this.$el[0].style.display = 'block';
                }
            },

            fileCompletionHandler : function () {
                this.render();
            }


        });


    }
)
;