/**
 * User: Matthieu Holzer
 * Date: 04.11.12
 * Time: 16:46
 */

define(['jquery', 'underscore', 'backbone', 'hbs!templates/composition', 'jquery-mousewheel', 'toe'],
    function ($, _, Backbone, Template) {

        return Backbone.View.extend({

            initialize : function () {

                _.bindAll(this, 'mouseWheelHandler');
            },

            scale : 1,

            events : {
                'mousewheel' : 'mouseWheelHandler'

            },

            mouseWheelHandler : function (e, delta, deltaX, deltaY) {
                'use strict';

                if (delta > 0) {
                    this.scale += 0.1;
                }
                else {
                    if (this.scale > 0) this.scale -= 0.1;
                }

                this.$el.find('#composition').css('transform', 'scale(' + (this.scale) + ')');
            },

            render : function () {
                'use strict';

                if (!this.model) return this;

                this.$el.html(Template(this.model.toJSON()));

                return this;
            }

        });


    });