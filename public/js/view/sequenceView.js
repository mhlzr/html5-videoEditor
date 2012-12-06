/**
 * User: Matthieu Holzer
 * Date: 06.11.12
 * Time: 18:28
 */

define(["jquery", 'underscore', "backbone", 'device', 'config', 'jquery-ui', 'jquery-ui-rotatable'], function ($, _, Backbone, Device, Config) {

    return Backbone.View.extend({

        video  : null,
        canvas : null,
        ctx    : null,
        asset  : null,

        isPlaying : false,

        initialize : function () {
            "use strict";

            _.bindAll(this, 'dblclickHandler', 'clickHandler', 'mouseResizeHandler');

            this.asset = this.model.getAsset();
            this.$el.css({
                'width'   : this.model.get('width') * this.model.get('scale'),
                'height'  : this.model.get('height') * this.model.get('scale'),
                'left'    : this.model.get('x'),
                'top'     : this.model.get('y'),
                'z-index' : this.model.get('index')
            });
        },

        events : {
            'dblclick' : 'dblclickHandler',
            'click'    : 'clickHandler',
            'dragmove' : 'positionChangeHandler'
        },

        render : function () {
            "use strict";

            if (!this.model || !this.asset) return this;

            if (this.asset.get('type') === 'video') {
                this.video = document.createElement('video');
                this.canvas = document.createElement('canvas');
                this.ctx = this.canvas.getContext('2d');


                //mouse-controls
                if (!Device.hasTouch) {

                    this.$el.resizable({
                        aspectRatio : true,
                        ghost       : false,
                        minWidth    : Config.MEDIA_VIDEO_MIN_WIDTH,
                        minHeight   : Config.MEDIA_VIDEO_MIN_HEIGHT,
                        handles     : 'ne, nw, se, sw'
                    });

                    //TODO reenable it? there is no event for this one dispatched
                    //this.$el.rotatable();

                    //Add events
                    this.$el.on("resize", this.mouseResizeHandler);
                    //this.$el.on("rotate", this.mouseRotateHandler);

                }

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


            if (this.isPlaying) return;
            /* Video States
             HAVE_NOTHING (0) No data available
             HAVE_METADATA (1) Duration and dimensions are available
             HAVE_CURRENT_DATA (2) Data for the current position is available
             HAVE_FUTURE_DATA (3) Data for the current and future position is available, so playback could start
             HAVE_ENOUGH_DATA (4) Enough data to play the whole video is available
             */


            //TODO seekable timerange check

            //Video can be seeked
            if (this.video.readyState === this.video.HAVE_FUTURE_DATA ||
                this.video.readyState === this.video.HAVE_ENOUGH_DATA) {


                this.video.currentTime = (frame - this.model.get('position')) / fps;

            }

        },

        play : function (fps) {
            "use strict";

            if (this.isPlaying) return;
            this.isPlaying = true;

            var playbackRate = 1;
            //adapt the framerate and play the sequence, if fps was read from file
            if (this.model.get('fps') > 0) {
                playbackRate = fps / this.model.get('fps');
            }
            this.video.defaultPlaybackRate = playbackRate;
            this.video.playbackRate = playbackRate;
            this.video.play();
        },

        pause : function () {
            "use strict";
            if (!this.isPlaying) return;
            this.isPlaying = false;
            this.video.pause();
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

        mouseResizeHandler : function (e) {
            "use strict";
            var newH = parseInt(this.$el.css('height')),
                origH = this.model.get('height');

            //never change the height/width only the scale
            this.model.set('scale', newH / origH);

        },

        mouseRotateHandler : function (e) {
            "use strict";
            console.log('rotate', e)
        },

        positionChangeHandler : function () {
            "use strict";
            var x = parseInt(this.$el.css('left')),
                y = parseInt(this.$el.css('top'));
            this.model.set('x', x);
            this.model.set('y', y);
        },


        destroy : function () {
            "use strict";
            this.remove();
        }



    });


})
;