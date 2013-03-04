/**
 * User: Matthieu Holzer
 * Date: 15.11.12
 * Time: 21:51
 */

define(['jquery', 'underscore', 'backbone', 'hbs!templates/sequenceCut'], function ($, _, Backbone, Template) {

    return Backbone.View.extend({

        asset     : null,
        video     : null,
        isPlaying : false,

        initialize : function () {
            'use strict';
            this.asset = this.model.getAsset();
        },

        events : {
            'click button' : 'buttonClickHandler'
        },


        buttonClickHandler : function (e) {
            "use strict";

            var $target = $(e.target);
            console.log(this.video);

            switch ($target.attr('data-cmd')) {
                case 'frameRewind' :
                    this.rewind(this.model.fps);
                    break;
                case 'framePrev' :
                    this.rewind(1 / this.model.fps);
                    break;
                case 'frameForward' :
                    this.forward(this.model.fps);
                    break;
                case 'frameNext' :
                    this.forward(1 / this.model.fps);
                    break;

                case 'togglePlay' :
                    if (this.isPlaying) {
                        $target.removeClass('pause').addClass('play');
                        this.video.pause();
                    }
                    else {
                        $target.removeClass('play').addClass('pause');
                        this.video.play();
                    }
                    this.isPlaying = !this.isPlaying;
                    break;
            }
        },

        render : function () {
            'use strict';

            this.$el.html(Template(this.model.toJSON()));

            //doing this via the handlebars-template will fail cause the request will be send via XHR,
            //which is just wrong ... i guess
            this.video = document.createElement('video');

            //Load the video
            this.video.src = this.asset.getCompatibleMediaUrl();
            this.video.controls = true;
            this.video.width = this.asset.get('width');
            this.video.height = this.asset.get('height');

            this.$('.video').append(this.video);
        },

        rewind : function (frames) {
            "use strict";
            if (this.isReady()) this.video.currentTime = this.video.currentTime - frames;
        },

        forward : function (frames) {
            "use strict";
            if (this.isReady()) this.video.currentTime = this.video.currentTime + frames;
        },

        isReady : function () {
            "use strict";
            return this.video.readyState === this.video.HAVE_FUTURE_DATA || this.video.readyState === this.video.HAVE_ENOUGH_DATA;
        }

    });


})
;