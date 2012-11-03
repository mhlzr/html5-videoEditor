/**.
 * User: Matthieu Holzer
 * Date: 12.09.12
 * Time: 21:07
 */
define(["jquery", "backbone", "hbs!templates/projectInfo"], function ($, Backbone, Template) {

    return Backbone.View.extend({

        initialize : function () {
            this.model.on('change:title', this.render);
        },

        events : {
            'keyup h1' : 'titleChangeHandler'

        },

        titleChangeHandler : function (e) {
            this.model.set('title', $(e.target).text());
        },

        render : function () {

            if (!this.model) return this;

            this.$el.html(Template(this.model.toJSON()));

            return this;
        }

    });


});