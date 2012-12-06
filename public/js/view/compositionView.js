/**
 * User: Matthieu Holzer
 * Date: 04.11.12
 * Time: 16:46
 */

define(['jquery', 'underscore', 'backbone', 'device', 'hbs!templates/composition', 'view/sequenceView', 'jquery-mousewheel', 'jquery++', 'toe'],
    function ($, _, Backbone, Device, Template, SequenceView) {

        return Backbone.View.extend({

            sequenceViews : [],
            isPlaying     : false,
            playTimer     : null,

            initialize : function () {

                _.bindAll(this, 'mouseWheelHandler', 'transformHandler', 'render', 'playheadChangeHandler', 'playTimerUpdateHandler', 'sequenceAddedHandler', 'sequenceRemovedHandler');

                this.model.on('change:playhead', this.playheadChangeHandler);

                this.model.get('sequences').on('add', this.sequenceAddedHandler);
                this.model.get('sequences').on('remove', this.sequenceRemovedHandler);
                this.model.get('sequences').on('change', this.sequenceChangedHandler);

                this.render();
            },

            events : {
                'mousewheel'            : 'mouseWheelHandler',
                'draginit div.sequence' : 'sequenceDragStartHandler',

                //mobile
                'transform'             : 'transformHandler'

            },

            mouseWheelHandler : function (e, delta, deltaX, deltaY) {
                'use strict';
                this.scale(this.model.get('scale') + (delta > 0 ? 0.1 : -0.1));
            },


            sequenceDragStartHandler : function (e, drag) {
                "use strict";
                drag.data = {'type' : 'sequence'};

            },

            transformHandler : function (e) {
                "use strict";
                this.scale(e.scale);
            },

            scale : function (factor) {
                "use strict";

                if (factor > 0) {
                    var $composition = $('#composition');
                    this.model.set('scale', factor);

                    if (Device.hasZoom) {
                        $composition.css('zoom', factor);
                    }
                    //firefox does not support zoom
                    else {
                        $composition.css('transform', 'scale(' + (factor) + ')');

                    }
                }
            },


            render : function () {
                'use strict';
                var self = this,
                    view = null;

                this.$el.html(Template(this.model.toJSON()));

                this.$('#composition').css({
                    'margin-top'  : -this.model.get('height') / 2,
                    'margin-left' : -this.model.get('width') / 2
                });

                //create all sequence-views
                this.model.get('sequences').each(function (sequence) {

                    view = self.createSequenceView(sequence).render();

                    if (self.isSequenceVisibleAtCurrentPlayheadPosition(view)) {
                        view.$el.show();
                    }
                    else {
                        view.$el.hide();
                    }
                });

                return this;
            },

            sequenceAddedHandler : function (sequence) {
                "use strict";
                this.createSequenceView(sequence).render();
            },

            sequenceRemovedHandler : function (sequence) {
                "use strict";

                //remove from internal array
                this.sequenceViews = _.reject(this.sequenceViews, function (sequenceView) {
                    return sequenceView.model.id === sequence.id;
                });

                //remove from DOM
                $('#' + sequence.id).remove();
            },

            createSequenceView : function (sequence) {
                "use strict";

                this.$el.find('#composition').append('<div id="' + sequence.id + '" class="sequence"></div>');

                var view = new SequenceView({
                    model : sequence,
                    el    : $('#' + sequence.id)
                });

                this.sequenceViews.push(view);

                return view;
            },

            playheadChangeHandler : function () {
                "use strict";

                var self = this;

                var playhead = this.model.get('playhead'),
                    fps = this.model.get('fps');


                _.each(this.sequenceViews, function (sequenceView) {

                    if (self.isSequenceVisibleAtCurrentPlayheadPosition(sequenceView)) {

                        sequenceView.$el.show();
                        sequenceView.update(playhead, fps);

                        if(self.isPlaying){
                            if(!sequenceView.isPlaying){
                                sequenceView.play(self.model.get('fps'));
                            }
                        }
                        else{

                        }

                    }
                    else{
                        sequenceView.$el.hide();
                        sequenceView.pause();
                    }
                });

            },


            play : function () {
                "use strict";
                if (this.isPlaying) return;

                this.isPlaying = true;
                this.playheadChangeHandler();
                this.playTimer = window.setInterval(this.playTimerUpdateHandler, 1000 / this.model.get('fps'))

            },


            playTimerUpdateHandler : function () {
                "use strict";
                if(!this.isPlaying) return;
                this.model.set('playhead', this.model.get('playhead') + 1);
            },

            isSequenceVisibleAtCurrentPlayheadPosition : function (sequenceView) {
                "use strict";
                var model = sequenceView.model;
                return  this.model.get('playhead') >= model.get('position') &&
                    this.model.get('playhead') <= (model.get('position') + model.get('duration') * this.model.get('fps'));
            },

            pause : function () {
                "use strict";

                window.clearInterval(this.playTimer);
                this.playTimer = null;

                this.isPlaying = false;

                //pause all sequence-views
                _.each(this.sequenceViews, function (sequenceView) {
                    sequenceView.pause();
                });
            },

            togglePlayPause : function () {
                "use strict";
                this.isPlaying ? this.pause() : this.play();
            },

            destroy : function () {
                "use strict";

                this.sequenceViews.each(function (sequence) {
                    sequence.destroy();
                });
            }

        });


    })
;