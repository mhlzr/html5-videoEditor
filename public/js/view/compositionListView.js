/**
 * User: Matthieu Holzer
 * Date: 01.11.12
 * Time: 15:18
 */
define(['jquery', 'underscore', 'backbone', 'view/compositionListElementView', 'view/compositionView', 'toe'],

    function ($, _, Backbone, CompositionListElementView, CompositionView) {

        return Backbone.View.extend({

            initialize : function () {


                _.bindAll(this, 'render', 'compositionSelectHandler');

                this.collection.on('add', this.render);
                this.collection.on('remove', this.render);
            },

            events : {
                'dblclick div.composition'  : 'compositionSelectHandler',

                //mobile
                'doubletap div.composition' : 'compositionSelectHandler'
            },

            compositionSelectHandler : function (e) {
                "use strict";

                app.currentComposition = this.collection.get(e.currentTarget.id);
                app.views.composition = new CompositionView({
                    model : app.currentComposition,
                    el     : $('#compositionContainer')
                });

                app.views.composition.render();

            },

            renderCompositionListView : function (composition) {
                "use strict";

                //without an id the composition shouldn't be rendered
                if (!composition.id) return;

                var compositionView = new CompositionListElementView({model : composition, el : this.$el}),
                    $compositionEl = this.$el.find('#' + composition.id);

                //hasn't been rendered before
                if (_.isEmpty($compositionEl[0])) {
                    //strange bug in firefox that produces duplicates
                    $($compositionEl).remove();
                    this.$el.append(compositionView.render());
                }
                //needs update
                else {
                    $compositionEl.replaceWith(compositionView.render());
                }
            },

            render : function () {

                if (!this.collection) return null;

                _.each(this.collection.models, function (composition) {
                    this.renderCompositionListView(composition);
                }, this);

                return this.$el.html();
            }
        })
            ;


    })
;