/**
 * User: Matthieu Holzer
 * Date: 06.11.12
 * Time: 18:28
 */

define(["jquery", "backbone"], function ($, Backbone) {

    return Backbone.View.extend({

        initialize : function () {
        },

        render : function () {
            "use strict";

            if (!this.model) return this;
            //TODO how does a sequence get rendered
            //get video file/url
            //check video status
            //check currentFrame
            //apply effects
            //render
        }

    });


});