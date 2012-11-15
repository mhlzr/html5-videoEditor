/**
 * User: Matthieu Holzer
 * Date: 04.11.12
 * Time: 16:46
 */

define(['jquery', 'underscore', 'backbone', 'hbs!templates/composition', 'view/sequenceView', 'jquery-mousewheel', 'toe'],
    function ($, _, Backbone, Template, SequenceView) {

        return Backbone.View.extend({

            sequenceViews : [],

            initialize : function () {

                _.bindAll(this, 'mouseWheelHandler', 'transformHandler', 'render');

                this.model.on('change:playhead', this.render);

            },

            events : {
                'mousewheel' : 'mouseWheelHandler',

                //mobile
                'transform'  : 'transformHandler'

            },

            mouseWheelHandler : function (e, delta, deltaX, deltaY) {
                'use strict';
                this.model.set('scale', this.model.get('scale') + (delta > 0 ? 0.1 : -0.1));
                this.scale(this.model.get('scale'));
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

                var self = this,
                    view;

                //create all sequence-views
                this.model.get('sequences').each(function (sequence) {

                    self.$el.find('#composition').append('<div id="' + sequence.id + '" class="sequence"></div>');

                    view = new SequenceView({
                        model : sequence,
                        el    : $('#' + sequence.id)
                    });

                    self.sequenceViews.push(view);
                    view.render();
                });

                return this;
            },


            play : function (position) {
                "use strict";

            },

            pause : function () {
                "use strict";

            }

        });


    });