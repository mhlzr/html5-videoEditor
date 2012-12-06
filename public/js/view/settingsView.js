define(['backbone', 'jquery', 'hbs!templates/settings'],

    function (Backbone, $, Template) {

        return Backbone.View.extend({

            events : {
                'change input' : 'changeHandler',
                'click .okay'  : 'confirmHandler'
            },
            render : function () {
                'use strict';
                this.$el.html(Template(this.model.toJSON()));
            },

            confirmHandler : function (e) {
                'use strict';
                this.$el.trigger('reveal:close');
            },

            changeHandler : function (e) {
                'use strict';
                this.model.set(e.target.id, $(e.target).is(':checked'))
            }

        });

    });
