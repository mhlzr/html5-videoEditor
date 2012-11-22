/**
 * User: Matthieu Holzer
 * Date: 15.11.12
 * Time: 21:51
 */

define(['jquery', 'underscore', 'backbone', 'hbs!templates/sequenceCut'], function ($, _, Backbone, Template) {

    return Backbone.View.extend({

        asset       : null,
        cuttingMode : false,

        initialize : function () {
            'use strict';
            this.asset = this.model.getAsset();
        },

        render : function () {
            'use strict';
            this.$el.html(Template(_.extend(this.model.toJSON(), {
                "cuttingMode" : this.cuttingMode ? 'cut' : 'preview'
            })));

        }

    });


});