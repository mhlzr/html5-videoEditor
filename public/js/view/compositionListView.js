/**
 * User: Matthieu Holzer
 * Date: 01.11.12
 * Time: 15:18
 */
define(['jquery', 'underscore', 'backbone', 'view/compositionListElementView', 'jquery-hammer'],

    function ($, _, Backbone, CompositionView) {

        return Backbone.View.extend({

            initialize : function () {


                _.bindAll(this, 'render');

                this.collection.on('add', this.render);
                this.collection.on('remove', this.render);
            },

            renderCompositionView : function (composition) {

                //without an id the composition shouldn't be rendered
                if (!composition.id) return;

                var compositionView = new CompositionView({model : composition, el : this.$el}),
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
                    this.renderCompositionView(composition);
                }, this);

                return this.$el.html();
            }
        });


    })
;