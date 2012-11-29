/**
 * User: Matthieu Holzer
 * Date: 01.11.12
 * Time: 15:18
 */
define(['jquery', 'underscore', 'backbone', 'view/compositionListElementView', 'toe'],

    function ($, _, Backbone, CompositionListElementView) {

        return Backbone.View.extend({

            currentComposition : null,

            initialize : function () {


                _.bindAll(this, 'render', 'compositionSelectHandler');

                this.collection.on('add', this.render);
                this.collection.on('remove', this.render);
                this.collection.on('change', this.render);

            },

            events : {
                'click div.composition'     : 'compositionClickHandler',
                'dblclick div.composition'  : 'compositionSelectHandler',
                'draginit div.composition'  : 'compositionDragStartHandler',

                //mobile
                'doubletap div.composition' : 'compositionSelectHandler'
            },

            compositionClickHandler : function (e) {
                "use strict";

                var $target = $(e.currentTarget),
                    id = $target[0].id;

                this.currentComposition = this.collection.get(id);

                //highlight
                $('.compositions').removeClass('active');
                $target.addClass('active');

                //enable controls, depending on asset status
                app.controller.toggleListControlsAvailability(true, true);
            },

            compositionDragStartHandler : function (e, drag) {
                "use strict";

                //don't know how to deactivate the jquery++-delegation,
                //so had to do this workaround to get the target-id
                var el = e.originalEvent.target;

                while (!$(el).hasClass('composition')) {
                    el = el.parentElement;
                }

                drag.data = {'type' : 'composition', 'id' : el.id};
                drag.ghost();
            },

            compositionSelectHandler : function (e) {
                "use strict";
                app.currentComposition = this.collection.get(e.currentTarget.id);
                app.controller.openComposition();
            },

            renderCompositionListView : function (composition) {
                "use strict";

                //without an id the composition shouldn't be rendered
                if (!composition.id) return;

                var compositionView = new CompositionListElementView({model : composition, el : this.$el}),
                    $compositionEl = this.$el.find('#' + composition.id);

                //hasn't been rendered before
                if (_.isEmpty($compositionEl[0])) {
                    this.$el.append(compositionView.render());
                }
                //needs update
                else {
                    $compositionEl.replaceWith(compositionView.render());
                }
            },

            render : function () {

                if (!this.collection) return null;

                this.$el.empty();

                _.each(this.collection.models, function (composition) {
                    this.renderCompositionListView(composition);
                }, this);

                return this.$el.html();
            },

            highlight : function (id) {
                "use strict";
                $('.composition').removeClass('active');
                $('#' + id).addClass('active');
            }
        });


    })
;