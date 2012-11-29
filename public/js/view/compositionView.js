/**
 * User: Matthieu Holzer
 * Date: 04.11.12
 * Time: 16:46
 */

define(['jquery', 'underscore', 'backbone', 'hbs!templates/composition', 'view/sequenceView', 'jquery-mousewheel', 'jquery++', 'toe'],
    function ($, _, Backbone, Template, SequenceView) {

        return Backbone.View.extend({

            sequenceViews : [],
            isPlaying     : false,
            playTimer     : null,

            initialize : function () {

                _.bindAll(this, 'mouseWheelHandler', 'transformHandler', 'render', 'update', 'sequenceAddedHandler', 'sequenceRemovedHandler');

                this.model.on('change:playhead', this.update);

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
                this.model.set('scale', this.model.get('scale') + (delta > 0 ? 0.1 : -0.1));
                this.scale(this.model.get('scale'));
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
                    this.model.set('scale', factor);
                    this.$el.find('#composition').css('transform', 'scale(' + (this.model.get('scale')) + ')');
                }
            },

            rotate : function (deg) {
                "use strict";

            },


            render : function () {
                'use strict';

                console.log('CompositionView::render()');

                if (!this.model) return this;

                this.$el.html(Template(this.model.toJSON()));

                this.$('#composition').css({
                    'margin-top'  : -this.model.get('height') / 2,
                    'margin-left' : -this.model.get('width') / 2
                });

                var self = this;

                //create all sequence-views
                this.model.get('sequences').each(function (sequence) {
                    self.createSequenceView(sequence).render();
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

            update : function () {
                "use strict";

                //would cause a loop elsewise
                if (this.isPlaying) return this;

                var playhead = this.model.get('playhead'),
                    fps = this.model.get('fps');

                //update all sequence-views
                _.each(this.sequenceViews, function (sequenceView) {
                    sequenceView.update(playhead, fps);
                });

                return this;
            },


            play : function (startFrame) {
                "use strict";

                if (this.isPlaying) return;

                //play all sequence-views
                _.each(this.sequenceViews, function (sequenceView) {
                    sequenceView.play(startFrame);
                });

                //i don't like this, but have no either how i should manage this
                //via requestAnimationFrame
                var self = this;
                this.playTimer = window.setInterval(function () {
                    self.model.set('playhead', self.model.get('playhead') + 1);
                }, 1000 / this.model.get('fps'))

            },

            pause : function () {
                "use strict";

                window.clearInterval(this.playTimer);
                this.playTimer = null;

                //pause all sequence-views
                _.each(this.sequenceViews, function (sequenceView) {
                    sequenceView.pause();
                });
            },

            togglePlayPause : function () {
                "use strict";
                this.isPlaying ? this.pause() : this.play();
                this.isPlaying = !this.isPlaying;
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