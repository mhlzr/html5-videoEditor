/**
 * User: Matthieu Holzer
 * Date: 15.11.12
 * Time: 21:51
 */

define(['jquery', 'backbone', 'hbs!templates/sequenceCut'], function ($, Backbone) {

    return Backbone.View.extend({

        asset : null,

        initialize : function () {
            'use strict';
            this.asset = this.model.getAsset();
        },

        render : function () {
            'use strict';


        }

    });


});