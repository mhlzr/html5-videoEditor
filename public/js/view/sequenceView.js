/**
 * User: Matthieu Holzer
 * Date: 06.11.12
 * Time: 18:28
 */

define(["jquery", "backbone"], function ($, Backbone) {

    return Backbone.View.extend({

        video  : null,
        canvas : null,
        ctx    : null,
        asset  : null,

        initialize : function () {
            "use strict";

            this.asset = this.model.getAsset();


        },

        render : function () {
            "use strict";

            if (!this.model) return this;

            if (this.asset.get('type') === 'video') {
                this.video = document.createElement('video');
                this.canvas = document.createElement('canvas');
                this.ctx = this.canvas.getContext('2d');

                //Load the video
                this.video.src = this.asset.getCompatibleMediaUrl();

                this.$el.append(this.video);

                this.video.play();
            }


            //Debug
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(0, 0, 100, 100);

            //TODO how does a sequence get rendered
            //get video file/url
            //check video status
            //check currentFrame
            //apply effects
            //render
            return this;
        },

        getImageData : function (x, y, w, h) {
            "use strict";

            x = x || 0;
            y = y || 0;
            w = w || this.model.get('w');
            h = h || this.model.get('h');

            return this.ctx.getImageData(x, y, w, h);

        }

    });


});