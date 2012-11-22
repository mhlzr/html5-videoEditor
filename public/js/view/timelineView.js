/**
 * User: Matthieu Holzer
 * Date: 07.11.12
 * Time: 10:47
 */

define(["jquery", "backbone", 'underscore', 'utils', 'config', 'hbs!templates/timelineLayer', 'hbs!templates/timelineInfo', 'jquery++', 'jquery-scrollTo'],

    function ($, Backbone, _, Utils, Config, TimelineLayerTemplate, TimelineInfoTemplate) {

        return Backbone.View.extend({

            isPlaying : false,

            initialize : function () {
                "use strict";
                _.bindAll(this, 'playheadChangeHandler', 'render', 'sequenceAddedHandler', 'sequenceRemovedHandler', 'sequenceChangedHandler');

                this.model.get('sequences').on('add', this.sequenceAddedHandler);
                this.model.get('sequences').on('remove', this.sequenceRemovedHandler);
                this.model.get('sequences').on('change', this.sequenceChangedHandler);

                this.resetView();
                this.renderTimeScale();

                this.render();
            },

            events : {
                //jquery++ dnd events
                'draginit div.layer .bar' : 'draginitLayerBarHandler',
                'dragend div.layer .bar'  : 'dragEndLayerBarHandler',

                'draginit #picker' : 'dragInitPickerHandler',
                'dragend #picker'  : 'dragEndPickerHandler',

                'click #timescale'        : 'timescaleClickHandler',
                'click .layerInfo button' : 'buttonClickHandler',

                'keyup div.layerInfo .span' : 'layerInfoNameChangeHandler'
                // 'keydown'                   : 'keydownHandler'
            },

            draginitLayerBarHandler : function (e, drag) {
                "use strict";

                var $el = $(e.originalEvent.srcElement),
                    $layerContainer = $('#layerContainer'),
                    parent = $el.parent();

                drag.horizontal();
                drag.step({x : Config.GUI_TIMELINE_PIXEL_PER_FRAME}, $layerContainer);
                drag.scrolls($layerContainer, {
                    distance  : 50,
                    delta     : function (diff) {
                        return (50 - diff) / 2
                    },
                    direction : "x"
                });

            },

            dragEndLayerBarHandler : function (e, drag, drop) {
                "use strict";

                var $el = $(drag.element),
                    $parent = $el.parent(),
                    id = $parent.attr('data-id'),
                    pos = parseInt($el.css('left').replace('px', ''));

                //store the changes to the model
                this.model.get('sequences').get(id).set('position', pos / Config.GUI_TIMELINE_PIXEL_PER_FRAME);

            },

            dragInitPickerHandler : function (e, drag) {
                "use strict";

                drag.step({x : Config.GUI_TIMELINE_PIXEL_PER_FRAME});
                drag.horizontal();
                drag.limit($('#timescale'));
            },

            dragEndPickerHandler : function (e, drag, drop) {
                "use strict";
                var x = (this.$('#picker').css('left').replace('px', '')) | 0;
                this.changePlayheadPosition(x);
            },


            timescaleClickHandler : function (e) {
                "use strict";
                var x = e.originalEvent.pageX - $(e.target).parent().offset().left | 0;
                this.$('#picker').css('left', x);
                this.changePlayheadPosition(x);
            },

            layerInfoNameChangeHandler : function (e) {
                "use strict";
                console.log(e.target);
            },


            sequenceChangedHandler : function (sequence) {
                "use strict";
                this.renderSequence(sequence);
            },

            sequenceAddedHandler : function (sequence) {
                "use strict";
                this.renderSequence(sequence);
            },

            sequenceRemovedHandler : function (sequence) {
                "use strict";
                //removed from layerInfoContainer + layerContainer
                $('[data-id=' + sequence.id + ']').remove();

            },

            renderSequence : function (sequence) {
                "use strict";

                var $layerContainer = this.$('#layerContainer'),
                    $infoContainer = this.$('#layerInfoContainer'),
                    totalWidth = this.model.getTotalFrames() * Config.GUI_TIMELINE_PIXEL_PER_FRAME,
                    fps = this.model.get('fps'),
                    data;

                data = _.extend(sequence.toJSON(), {
                    totalWidth  : totalWidth,
                    barWidth    : sequence.get('duration') * fps * Config.GUI_TIMELINE_PIXEL_PER_FRAME | 0,
                    barPosition : sequence.get('position') * Config.GUI_TIMELINE_PIXEL_PER_FRAME | 0
                });

                //already existent so update
                if ($layerContainer.find('[data-id=' + sequence.id + ']').length > 0) {
                    $layerContainer.find('[data-id=' + sequence.id + ']').replaceWith(TimelineLayerTemplate(data));
                }
                //non-existent so create
                else {
                    $layerContainer.append(TimelineLayerTemplate(data));
                    $infoContainer.append(TimelineInfoTemplate(data));
                }

            },

            render : function () {
                "use strict";

                var self = this,
                    $picker = this.$('#picker'),
                    $layerContainer = this.$('#layerContainer');

                $layerContainer.css('width', this.model.length + 'px');

                //update slider height
                $picker.css('height', 500);//$layerContainer.innerHeight() + Math.abs($picker.css('top').replace('px', '')));

                //render all sequence views
                this.model.get('sequences').each(function (sequence) {
                    self.renderSequence(sequence);
                });

                return this;
            },


            renderTimeScale : function () {
                "use strict";

                var $el = this.$('#timescale'),
                    ctx = [],
                    cCanvas = null, //currentCanvas
                    cCtx = null, //currentCtx
                    iCtx = 0, //currentCtxIndex
                    posX = 0;

                //change the total width of the container
                $el.css('width', this.model.getTotalFrames() * Config.GUI_TIMELINE_PIXEL_PER_FRAME + 1000); //TODO find number

                //canvas' width is limited, so we need to create more of them
                while (ctx.length < this.model.getTotalFrames() * Config.GUI_TIMELINE_PIXEL_PER_FRAME / Config.GUI_TIMELINE_CANVAS_MAX_WIDTH) {

                    //create canvas(es)
                    cCanvas = document.createElement('canvas');
                    cCtx = ctx.push(cCanvas.getContext('2d'));

                    //configure canvas
                    cCanvas.width = Config.GUI_TIMELINE_CANVAS_MAX_WIDTH;
                    cCanvas.height = 40;

                    //configure canvas
                    cCtx.fillStyle = '#000000';
                    cCtx.strokeStyle = '#000000';
                    cCtx.lineWidth = 1;
                    cCtx.lineCap = 'butt';
                    cCtx.font = "10pt Verdana";
                    cCtx.textAlign = "center";

                    //append do DOM
                    $el.append(cCanvas);
                }


                for (var frame = 0; frame <= this.model.getTotalFrames(); frame++) {

                    if (frame > (1 + iCtx) * Config.GUI_TIMELINE_CANVAS_MAX_WIDTH / Config.GUI_TIMELINE_PIXEL_PER_FRAME) {

                        iCtx++;

                        //substract the already existent canvas-elements
                        //as each canvas starts at 0
                        posX = iCtx * Config.GUI_TIMELINE_CANVAS_MAX_WIDTH / 3;

                    }

                    ctx[iCtx].beginPath();
                    ctx[iCtx].moveTo((frame - posX) * Config.GUI_TIMELINE_PIXEL_PER_FRAME, 0);

                    //start 00:00:00:00
                    if (frame === 0) {
                        ctx[0].lineTo(0, 22);
                        ctx[0].fillText('Start', 4, 34);
                    }

                    //got a second
                    else if (frame % this.model.get('fps') === 0) {
                        ctx[iCtx].lineTo((frame - posX) * Config.GUI_TIMELINE_PIXEL_PER_FRAME, 22);
                        ctx[iCtx].fillText(Utils.getCleanTimeCode(frame, this.model.get('fps')), (frame - posX) * Config.GUI_TIMELINE_PIXEL_PER_FRAME - 20, 34);

                    }

                    //just a frame
                    else {
                        ctx[iCtx].lineTo((frame - posX) * Config.GUI_TIMELINE_PIXEL_PER_FRAME, 14);
                    }

                    ctx[iCtx].closePath();
                    ctx[iCtx].stroke();
                    ctx[iCtx].fill();
                }
            },

            resetView : function () {
                "use strict";
                this.$('#timescale, #layerInfoContainer').empty();
                this.$('#layerContainer .layer').remove();
            },

            buttonClickHandler : function (e) {
                "use strict";

                var $target = $(e.target),
                    id = $target.parent().attr("data-id"),
                    cmd = $target.attr("data-cmd"),
                    sequences = this.model.get('sequences'),
                    sequence = sequences.get(id);


                switch (cmd) {


                    case 'up' :
                        break;

                    case 'down' :
                        break;

                    case 'reset' :
                        sequences.remove(sequence);
                        break;

                    case 'remove' :
                        sequences.remove(sequence);
                        break;


                }


            },

            changePlayheadPosition : function (frame) {
                "use strict";

                frame = frame / Config.GUI_TIMELINE_PIXEL_PER_FRAME | 0;

                if (frame >= 0 && frame <= this.model.getTotalFrames()) {
                    this.model.set('playhead', frame);
                }
            },

            togglePlayPause : function () {
                "use strict";
                this.isPlaying ? this.removePlayheadListener() : this.addPlayheadListener();
                this.isPlaying = !this.isPlaying;
            },


            addPlayheadListener : function () {
                "use strict";
                this.model.on('change:playhead', this.playheadChangeHandler);
            },

            removePlayheadListener : function () {
                "use strict";
                this.model.off('change:playhead', this.playheadChangeHandler);
            },

            playheadChangeHandler : function (e, xPos) {
                "use strict";
                var $layerInfoContainer = $('#layerInfoContainer'),
                    $layerContainer = $('#layerContainer'),
                    viewportWidth = this.$el.width() - $layerInfoContainer.width() - Config.GUI_TIMELINE_AUTOSCROLL_PADDING;

                //viewportWidth must be divisible by frameWidth
                while (viewportWidth % Config.GUI_TIMELINE_PIXEL_PER_FRAME > 0) {
                    viewportWidth--;
                }

                xPos *= Config.GUI_TIMELINE_PIXEL_PER_FRAME;

                //autoscroll the timeline if playhead is moving
                if (xPos % (viewportWidth) === 0) {
                    $layerContainer.scrollTo('#picker');
                }

                $('#picker').css('left', xPos);

            },

            keydownHandler : function (e) {
                "use strict";

            }

        });


    })
;