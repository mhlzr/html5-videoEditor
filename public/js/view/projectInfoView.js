/**.
 * User: Matthieu Holzer
 * Date: 12.09.12
 * Time: 21:07
 */
define(["jquery", 'underscore', "backbone", "hbs!templates/projectInfo"], function ($, _, Backbone, Template) {

    return Backbone.View.extend({

        initialize : function () {
            _.bindAll(this, 'render');
        },

        events : {
            'keyup h1' : 'titleChangeHandler'

        },

        titleChangeHandler : function (e) {
            this.model.set('title', $(e.target).text());
        },

        render : function () {
            this.$el.html(Template(this.model.toJSON()));
            return this;
        }

    });


});