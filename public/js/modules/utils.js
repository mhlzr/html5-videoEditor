/**
 * User: Matthieu Holzer
 * Date: 21.10.12
 * Time: 20:28
 */
define(function () {


    Math.roundDec = function (n, dec) {
        dec = dec || 2;
        return Math.round(n * Math.pow(10, dec)) / Math.pow(10, dec);
    };

    return{

        /**
         * Converts frames to a timecode
         * @param frame current frame
         * @param fps the framerate
         * @param includeFrames whether to include frames (FF)
         * @return {String} format = HH:MM:SS:FF
         */
        getCleanTimeCode : function (frame, fps, includeFrames) {
            "use strict";

            includeFrames = includeFrames || false;

            var timecode = [],
                secTotal = frame / fps,
                h = secTotal / 3600 | 0,
                m = (secTotal / 60) % 60 | 0,
                s = secTotal % 60 | 0,
                f = frame % (fps) | 0;

            //format the strings
            timecode.push(h < 10 ? '0' + h : h);
            timecode.push(m < 10 ? '0' + m : m);
            timecode.push(s < 10 ? '0' + s : s);

            if (includeFrames) {
                timecode.push(f < 10 ? '0' + f : f);
            }

            return timecode.join(':');
        },


        getReadableDate : function (dateString) {
            "use strict";
            var date,
                now = new Date(),
                cleanDateString = [],
                cleanTimeString = [];

            try {
                date = new Date(dateString);
            }
            catch (e) {
                return "";
            }

            //DATE

            //today
            if (new Date((now - date)).getHours() < 24) {
                cleanDateString.push('Today');
            }
            //not today! :)
            else {
                cleanDateString.push(date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
                cleanDateString.push(date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth());
                cleanDateString.push(date.getFullYear());
            }

            //TIME
            cleanTimeString.push(date.getHours() < 10 ? '0' + date.getHours() : date.getHours());
            cleanTimeString.push(date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());

            return cleanDateString.join('/') + ' ' + cleanTimeString.join(':');
        }
    }
})
;