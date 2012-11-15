/**
 * User: Matthieu Holzer
 * Date: 07.11.12
 * Time: 10:47
 */

define(["jquery", "backbone", 'underscore', 'utils', 'config', 'hbs!templates/timelineLayer', 'hbs!templates/timelineInfo', 'jquery++'],

    function ($, Backbone, _, Utils, Config, TimelineLayerTemplate, TimelineInfoTemplate) {

        return Backbone.View.extend({


            initialize : function () {
                "use strict";
                _.bindAll(this, 'render', 'sequenceChangeHandler');
                this.model.get('sequences').on('add', this.render);
                this.model.get('sequences').on('change', this.sequenceChangeHandler);

                this.resetView();
                this.renderTimeScale();
            },

            events : {
                //jquery++ dnd events
                'draginit div.layer .bar' : 'draginitLayerBarHandler',
                'dragend div.layer .bar'  : 'dragEndLayerBarHandler',

                'draginit #picker' : 'dragInitPickerHandler',
                'dragend #picker'  : 'dragEndPickerHandler',

                'click #timescale' : 'timescaleClickHandler'
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
                var $el = $(e.originalEvent.srcElement),
                    parent = $el.parent(),
                    id = parent[0].id,
                    pos = $el.css('left').replace('px', '');

                if (isNaN(pos)) pos = 0;

                //store the changes to the model
                this.model.get('sequences').get(id).set('position', pos);

            },

            dragInitPickerHandler : function (e, drag) {
                "use strict";

                drag.step({x : Config.GUI_TIMELINE_PIXEL_PER_FRAME});
                drag.horizontal();
                drag.limit($('#timescale'));
            },

            dragEndPickerHandler : function (e, drag, drop) {
                "use strict";
                var x = (this.$('#picker').css('left').replace('px', '')) | 0,
                    frame = x / Config.GUI_TIMELINE_PIXEL_PER_FRAME | 0;

                this.changePlayheadPosition(frame);
            },


            timescaleClickHandler : function (e) {
                "use strict";
                var x = e.originalEvent.pageX - $(e.target).parent().offset().left;
                this.$('#picker').css('left', x);

                this.changePlayheadPosition(x / Config.GUI_TIMELINE_PIXEL_PER_FRAME | 0);
            },

            changePlayheadPosition : function (frame) {
                "use strict";
                if (frame >= 0 && frame <= this.model.getTotalFrames()) {
                    this.model.set('playhead', frame);
                }
            },

            sequenceChangeHandler : function (sequence) {
                "use strict";
                this.renderSequence(sequence);
            },

            renderSequence : function (sequence) {
                "use strict";
                this.$('#layerContainer').find('#' + sequence.id).replaceWith(TimelineLayerTemplate(sequence.toJSON()));
            },

            render : function () {
                "use strict";

                if (!this.model) return this;

                var $layerContainer = this.$('#layerContainer'),
                    $infoContainer = this.$('#layerInfoContainer'),
                    $picker = this.$('#picker'),
                    totalWidth = this.model.getTotalFrames() * Config.GUI_TIMELINE_PIXEL_PER_FRAME,
                    data;

                $layerContainer.css('width', this.model.length + 'px');

                this.model.get('sequences').each(function (sequence) {
                    data = _.extend(sequence.toJSON(), {
                        totalWidth : totalWidth
                    });

                    $layerContainer.append(TimelineLayerTemplate(data));
                    $infoContainer.append(TimelineInfoTemplate(data));

                });

                //update slider height
                $picker.css('height', 500);//$layerContainer.innerHeight() + Math.abs($picker.css('top').replace('px', '')));

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
            }

        });


    });