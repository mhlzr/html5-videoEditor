(function($, window, undefined) {
/**
 * Utility
 * @type {Object}
 */
var util = {};

/**
 * tries to get the touches from a jQuery(!) touch event
 * @param event
 * @return {TouchEvent[]}
 */
util.getTouches = function (event) {
    return event.originalEvent.touches.length > 0 ?
        $.extend(true, {}, event.originalEvent.touches) :
        (event.originalEvent.changedTouches.length > 0 ?
            $.extend(true, {}, event.originalEvent.changedTouches) :
            []
            );
};

/**
 *
 * @param $target
 * @param {String} event event name which should be tested against $target
 * @return {Boolean}
 */
util.hasEvent = function ($target, event) {
   return $target.data('events') ? $target.data('events')[event] : 0;
};
var calc = {};

/**
 * angle to direction define, getDirectionFromAngle
 * @param  float    angle
 * @return string   direction
 */
calc.getDirection = function (angle)
{
   if (angle < -45 && angle > -135) {
       return 'top';
   } else if (angle >= -45 && angle <= 45) {
       return 'right';
   } else if (angle >= 45 && angle < 135) {
       return 'down';
   } else if (angle >= 135 || angle <= -135) {
       return 'left';
   }
};

/**
 * @param {Object} pos1
 * @param {Number} pos1.pageX
 * @param {Number} pos1.pageY
 * @param {Object} pos2
 * @param {Number} pos2.pageX
 * @param {Number} pos2.pageY
 * @return {Number} angle between pos1 and pos2
 */
calc.getAngle = function (pos1, pos2)
{
    return Math.atan2(pos2.pageY - pos1.pageY, pos2.pageX - pos1.pageX) * 180 / Math.PI;
};

/**
 * @param {Object[]} start must contain the position of two fingers
 * @param {Number} start[].pageX
 * @param {Number} start[].pageY
 * @param {Object[]} move must contain the position of two fingers
 * @param {Number} move[].pageX
 * @param {Number} move[].pageY
 * @return {Number} scale size between two fingers
 */
calc.getScale = function (start, move)
{
    if(start.length === 2 && move.length === 2) { // needs to have the position of two fingers
        return (Math.sqrt(Math.pow(move[0].pageX - move[1].pageX, 2) + Math.pow(move[0].pageY - move[1].pageY, 2)) / Math.sqrt(Math.pow(start[0].pageX - start[1].pageX, 2) + Math.pow(start[0].pageY - start[1].pageY, 2)));
    }

    return 0;
};

/**
 * @param {Object[]} start must contain the position of two fingers
 * @param {Number} start[].pageX
 * @param {Number} start[].pageY
 * @param {Object[]} move must contain the position of two fingers
 * @param {Number} move[].pageX
 * @param {Number} move[].pageY
 * @return {Number} rotation degrees between two fingers
 */
calc.getRotation = function (start, move)
{
    if(start.length === 2 && move.length === 2) {
        return ((Math.atan2(move[0].pageY - move[1].pageY, move[0].pageX - move[1].pageX) * 180 / Math.PI) - (Math.atan2(start[0].pageY - start[1].pageY, start[0].pageX - start[1].pageX) * 180 / Math.PI));
    }

    return 0;
};

/**
 * @param {TouchEvent} startTouch
 * @param {TouchEvent} moveTouch
 * @return {Number} maximum distance the finger moved
 */
calc.getDistance = function (startTouch, moveTouch)
{
    return Math.sqrt(Math.pow(moveTouch.pageX - startTouch.pageX, 2) + Math.pow(moveTouch.pageY - startTouch.pageY, 2));
};
/**
 * current state of the runnign gesture
 *
 * @type {Object}
 * @type {Object} touches touches contains the TouchList objects of touchstart, touchmove and touchend
 * @type {TouchList[]} touches.start
 * @type {TouchList[]} touches.move
 * @type {TouchList[]} touches.end
 * @type {Object} events contains the TouchEvents of the current gestures
 * @type {TouchEvent} events.start
 * @type {TouchEvent} events.move
 * @type {TouchEvent} events.end
 * @type {Number} timestamp the time when the gesture started (ontouchstart)
 * @type {Object} offset the document offset of the current event target
 * @type {Number} offset.top
 * @type {Number} offset.left
 */
var state = {
    touches: {},
    events: {},
    timestamp: undefined,

    prevGesture: null,

    offset: {}
};

/**
 * resets the gesture the inital values
 */
state.clearState = function () {
    state.touches = {};
    state.events = {};
    state.timestamp = undefined;
};
/**
 * Contains all registered gestures
 * @type {Object}
 * @type {Object[]) start
 * @type {Object[]) move
 * @type {Object[]) end
 */
var gestures = {
	start:[],
	move:[],
	end:[],
	none:[]
};

/**
 * Add new gesture
 *
 * @param {String} timing can be either 'start', 'move' or 'end' of the touch behavior
 * @param {String} gesture name of the gesture
 * @param {Function} func to be called at the given timing
 * @param {Number} priority if necessary for calling order or undefined
 */
gestures.add = function (timing, gesture, func, priority) {
	var i,
		tmp,
		inserted = false;

	if (priority) {
		for (i = 0; i < gestures[timing].length; i++) {
			tmp = gestures[timing][i];

			if (tmp.priority && tmp.priority < priority) {
				continue;
			}

			gestures[timing].splice(i, 0, {
				gesture:gesture,
				func:func,
				priority:undefined
			});
			inserted = true;
		}
	}

	if (!priority || !inserted) {
		gestures[timing].push({
			gesture:gesture,
			func:func,
			priority:undefined
		});
	}

	registerSpecialEvent(gesture);
};

/**
 * @private
 * @param timing
 * @param event
 */
gestures.exec = function (timing, event) {
	var i;

	for (i = 0; i < gestures[timing].length; i++) {
		gestures[timing][i].func(event);
	}
};
/*!
 * toe.js
 * version 1.2
 * author: Damien Antipa
 * https://github.com/dantipa/toe.js
 */
var isTouch = !!('ontouchstart' in window),
    $proxyStart, $proxyMove, $proxyEnd;

/**
 *
 * @param {jQuery.Event} event
 */
function touchstart(event) {
    var $target = $(event.target);

    state.clearState();

    state.touches.start = util.getTouches(event);
    state.events.start = event;
    state.timestamp = new Date().getTime();

    state.events.start = event;

    state.offset = $target.offset();

    gestures.exec('start', event);
}

/**
 *
 * @param {jQuery.Event} event
 */
function touchmove(event) {
    if(!state.timestamp) {
        return;
    }

    state.touches.move = util.getTouches(event);
    state.events.move = event;

    gestures.exec('move', event);
}

/**
 *
 * @param {jQuery.Event} event
 */
function touchend(event) {
    if(!state.timestamp) {
        return;
    }

    state.touches.end = util.getTouches(event);
    state.events.end = event;

    gestures.exec('end', event);

    state.prevGesture = state.gesture;
    state.clearState();
}

$proxyStart = $.proxy(touchstart, this);
$proxyMove = $.proxy(touchmove, this);
$proxyEnd = $.proxy(touchend, this);

function eventSetup(data, namespaces, eventHandler) {
    var $this = $(this),
        toe = $this.data('toe') || 0;

    if (toe === 0) {
        $this.on('touchstart', $proxyStart);
        $this.on('touchmove', $proxyMove);
        $this.on('touchend touchcancel', $proxyEnd);
    }

    $this.data('toe', ++toe);
}

function eventTeardown(namespace) {
    var $this = $(this),
        toe = $this.data('toe') || 0;

    $this.data('toe', --toe);

    if (toe === 0) {
        $this.off('touchstart', $proxyStart);
        $this.off('touchmove', $proxyMove);
        $this.off('touchend touchcancel', $proxyEnd);
    }
}

function registerSpecialEvent(eventName) {
	if (isTouch) { // event binding will just work on touch devices
		$.event.special[eventName] = {
			setup: eventSetup,
			teardown: eventTeardown
		};
	}
}
(function (gestures, state, calc) {

    var config = {
            swipe_time: 300,
            swipe_min_distance: 30
        };

    /**
     *
     * @param {jQuery.Event} event
        */
    function swipe(event)
    {
        var duration = new Date().getTime() - state.timestamp,
            angle,
            direction,
            distance;

        if(!state.touches.move) {
            return;
        }

        distance = calc.getDistance(state.touches.start[0], state.touches.move[0]);
        if((config.swipe_time > duration) && (distance > config.swipe_min_distance)) {

            angle = calc.getAngle(state.touches.start[0], state.touches.move[0]);
            direction = calc.getDirection(angle);

            state.gesture = 'swipe';
            $(event.target).trigger($.Event('swipe', {
                originalEvent   : event.originalEvent,
                direction       : direction
            }));
        }
    }

    gestures.add('end', 'swipe', swipe);

}(gestures, state, calc));
(function (gestures, state, calc, util) {

    var config = {
            tap_double_max_interval: 300,
            tap_max_distance: 10,
            tap_distance: 20,

            hold_timeout: 500
        },
        distance,
        prevTapPos,
        prevTapEndTime,
        holdTimer;

    /**
     *
     * @param {jQuery.Event} event
     */
    function tap(event)
    {
        var timestamp = new Date().getTime(),
            duration = timestamp - state.timestamp,
            $target = $(event.target);

        if (config.hold_timeout < duration) { // if the hold was already fired do not fire a tap
            return;
        }

        event = state.events.start.originalEvent;

        if (!doubletap(event)) {
            distance = state.touches.move ? calc.getDistance(state.touches.start[0], state.touches.move[0]) : 0;

            if (distance < config.tap_max_distance) {
                state.gesture = 'tap';

                prevTapEndTime = timestamp;
                prevTapPos = state.touches.start;

                if (util.hasEvent($target, 'doubletap')) { // doubletap event is bound to the target
                    setTimeout(function() { // the tap event will be delayed because there might be a double tap
                        if(prevTapPos && state.prevGesture !== 'doubletap' && ((new Date().getTime() - prevTapEndTime) > config.tap_double_max_interval)) {
                            $target.trigger($.Event('tap', {
                                originalEvent: event
                            }));
                        }
                    }, config.tap_double_max_interval);
                } else {
                    $target.trigger($.Event('tap', {
                        originalEvent: event
                    }));
                }
            }
        }
    }

    /**
     *
     * @param {jQuery.Event} event
     * @return {Boolean} true if doubletap was recognized
     */
    function doubletap(event) {
        if (prevTapPos && state.prevGesture === 'tap' && (state.timestamp - prevTapEndTime) < config.tap_double_max_interval)
        {
            if (prevTapPos && state.touches.start && (calc.getDistance(prevTapPos[0], state.touches.start[0]) < config.tap_distance)) {

                state.gesture = 'doubletap';
                prevTapEndTime = null;

                $(event.target).trigger($.Event('doubletap', {
                    originalEvent: event
                }));

                return true;
            }
        }
        return false;
    }

    /**
     *
     * @param {jQuery.Event} event
     */
    function taphold(event)
    {
        state.gesture = 'taphold';
        clearTimeout(holdTimer);

        holdTimer = setTimeout(function() {
            if (state.touches.start && !state.touches.end) { // touch event already completed
                distance = state.touches.move ? calc.getDistance(state.touches.start[0], state.touches.move[0]) : 0;

                if (distance < config.tap_max_distance && state.gesture === 'taphold') {
                    $(event.target).trigger($.Event('taphold', {
                        originalEvent: state.events.start ? state.events.start.originalEvent : event.originalEvent
                    }));
                }
            }
        }, config.hold_timeout);

    }

    gestures.add('end', 'tap', tap);
	gestures.add('none', 'doubletap', $.noop);
    gestures.add('start', 'taphold', taphold);

}(gestures, state, calc, util));
(function (gestures, state, calc) {

    var config = {
            scale_treshold     : 0.1,
            rotation_treshold  : 15 // °
        },
        started = false,
        center;

    /**
     *
     * @param {jQuery.Event} event
     */
    function transform(event)
    {
        var rotation,
            scale,
            $target = $(event.target);

        if(state.touches.move.length !== 2) {
            return;
        }

        rotation = calc.getRotation(state.touches.start, state.touches.move);
        scale = calc.getScale(state.touches.start, state.touches.move);

        if(state.gesture === 'transform' || Math.abs(1-scale) > config.scale_treshold || Math.abs(rotation) > config.rotation_treshold) {
            state.gesture = 'transform';

            center = {  pageX: ((state.touches.move[0].pageX + state.touches.move[1].pageX) / 2) - state.offset.left,
                pageY: ((state.touches.move[0].pageY + state.touches.move[1].pageY) / 2) - state.offset.top };

            if(!started) {
                $target.trigger($.Event('transformstart', {
                    originalEvent: event.originalEvent,
                    center: center,
                    scale: scale,
                    rotation: rotation
                }));
                started = true;
            }

            $target.trigger($.Event('transform', {
                originalEvent: event.originalEvent,
                center: center,
                scale: scale,
                rotation: rotation
            }));
        }
    }

    /**
     *
     * @param {jQuery.Event} event
     */
    function transformend(event)
    {
        var rotation,
            scale,
            $target = $(event.target);

        if(state.gesture === 'transform') {
            rotation = calc.getRotation(state.touches.start, state.touches.move);
            scale = calc.getScale(state.touches.start, state.touches.move);

            $target.trigger($.Event('transformend', {
                originalEvent: event.originalEvent,
                center: center,
                scale: scale,
                rotation: rotation
            }));

            started = false;
        }
    }

    gestures.add('move', 'transform', transform);
    gestures.add('end', 'transformend', transformend);

}(gestures, state, calc));
}(jQuery, window));