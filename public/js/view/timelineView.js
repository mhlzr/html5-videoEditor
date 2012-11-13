/**
 * User: Matthieu Holzer
 * Date: 07.11.12
 * Time: 10:47
 */

define(["jquery", "backbone", 'underscore', 'config', 'hbs!templates/timelineLayer', 'hbs!templates/timelineInfo', 'jquery++'],

    function ($, Backbone, _, Config, TimelineLayerTemplate, TimelineInfoTemplate) {

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
                'draginit #picker'        : 'dragInitPickerHandler',
                'dragend #picker'         : 'dragEndPickerHandler',

                'click #timescale' : 'timescaleClickHandler'
            },

            draginitLayerBarHandler : function (e, drag) {
                "use strict";

                var $el = $(e.originalEvent.srcElement),
                    parent = $el.parent();

                drag.horizontal();
                drag.step({x : 3}, $('#layerContainer'));
                drag.scrolls($('#layerContainer'), {
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
                var $el = $(e.originalEvent.srcElement),
                    parent = $el.parent();

                drag.step({x : 3}, parent);
                drag.horizontal();
            },

            dragEndPickerHandler : function (e, drag, drop) {
                "use strict";

            },

            timescaleClickHandler : function (e) {
                "use strict";
                console.log(e.target.offsetLeft, e.originalEvent.pageX, e.originalEvent.pageX - e.target.offsetLeft);
                this.$('#picker').css('left', e.originalEvent.pageX - e.target.offsetLeft);
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

            },


            renderTimeScale : function () {
                "use strict";

                var $el = this.$('#timescale'),
                    canvas = [],
                    ctx = [],
                    frameWidth = Config.GUI_TIMELINE_PIXEL_PER_FRAME,
                    currentSecond = 0,
                    currentMinute = 0,
                    currentHour = 0,
                    timeArray = [],
                    offsetX = 5; //margin-left


                //TODO: more canvases, scale not accurate...

                //create canvas(es) depends on time and maxWidth of canvas
                canvas[0] = document.createElement('canvas');
                ctx[0] = canvas[0].getContext('2d');

                canvas[0].width = 10000;//this.model.getTotalFrames() * frameWidth;
                canvas[0].height = 40;

                $el.append(canvas[0]);

                ctx[0].fillStyle = '#000000';
                ctx[0].strokeStyle = '#000000';
                ctx[0].lineWidth = 1;
                ctx[0].lineCap = 'butt';


                for (var i = 0; i <= this.model.getTotalFrames(); i++) {

                    timeArray = [];

                    ctx[0].beginPath();
                    ctx[0].moveTo(i * frameWidth + offsetX, 0);

                    //got a second
                    if (i % this.model.get('fps') === 0) {
                        ctx[0].lineTo(i * frameWidth + offsetX, 22);
                        ctx[0].font = "10pt Verdana";
                        ctx[0].textAlign = "center";

                        //calc time
                        timeArray.push( currentHour < 10 ? '0' + currentHour : currentHour );
                        timeArray.push( currentMinute < 10 ? '0' + currentMinute : currentMinute);
                        timeArray.push( currentSecond < 10 ? '0' + currentSecond : currentSecond);

                        ctx[0].fillText(timeArray.join(':'), i * frameWidth + offsetX, 34);

                        if (currentSecond % 60 === 0)currentMinute++;
                        if (currentMinute % 60 === 0)currentHour++;
                        currentSecond++;

                    }
                    //just a frame
                    else {
                        ctx[0].lineTo(i * frameWidth + offsetX, 14);
                    }

                    ctx[0].closePath();
                    ctx[0].stroke();
                    ctx[0].fill();
                }
            },

            resetView : function () {
                "use strict";
                this.$('#timescale, #layerInfoContainer').empty();
                this.$('#layerContainer .layer').remove();
            }

        });


    });