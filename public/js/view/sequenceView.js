/**
 * User: Matthieu Holzer
 * Date: 06.11.12
 * Time: 18:28
 */

define(["jquery", 'underscore', "backbone"], function ($, _, Backbone) {

    return Backbone.View.extend({

        video  : null,
        canvas : null,
        ctx    : null,
        asset  : null,

        initialize : function () {
            "use strict";

            _.bindAll(this, 'dblclickHandler', 'clickHandler');

            this.asset = this.model.getAsset();
            this.$el.css({
                'width'   : this.model.get('width'),
                'height'  : this.model.get('height'),
                'left'    : this.model.get('x'),
                'top'     : this.model.get('y'),
                'z-index' : this.model.get('index')
            });
        },

        events : {
            'dblclick' : 'dblclickHandler',
            'click'    : 'clickHandler'
        },

        render : function () {
            "use strict";

            if (!this.model || !this.asset) return this;

            if (this.asset.get('type') === 'video') {
                this.video = document.createElement('video');
                this.canvas = document.createElement('canvas');
                this.ctx = this.canvas.getContext('2d');

                //Load the video
                this.video.src = this.asset.getCompatibleMediaUrl();
                this.$el.append(this.video);

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

        update : function (frame, fps) {
            "use strict";

            var model = this.model;

            // console.log('start', model.get('position'), 'end', model.get('position') + model.get('duration') * fps, 'frame', frame);

            //sequence-frame will be rendered
            if (frame >= model.get('position') &&
                frame <= (model.get('position') + model.get('duration') * fps)) {
                //TODO frame render update
                this.$el.show();

                //if (this.video.canplay) {
                this.video.currentTime = (frame - model.get('position')) / fps;
                //}

                //console.log(frame, 'should be rendered');
            }
            //sequence will be hidden
            else {
                this.$el.hide();
            }

        },

        getImageData : function (x, y, w, h) {
            "use strict";

            x = x || 0;
            y = y || 0;
            w = w || this.model.get('w');
            h = h || this.model.get('h');

            return this.ctx.getImageData(x, y, w, h);

        },


        dblclickHandler : function () {
            "use strict";
            app.views.timeline.currentSequence = this;
            app.controller.showDialogue('sequenceCut', this.model);
            app.views.timeline.highlight();

        },

        clickHandler : function () {
            "use strict";
            app.views.timeline.currentSequence = this;
            app.views.timeline.highlight();
        },

        play : function (startFrame) {
            "use strict";
            this.video.play();
        },

        pause : function () {
            "use strict";
            this.video.pause();
        },


        destroy : function () {
            "use strict";
            this.remove();
        }

    });


});