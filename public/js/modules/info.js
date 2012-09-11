/**.
 * User: Matthieu Holzer
 * Date: 11.09.12
 * Time: 17:41
 */
define(["jquery", "lib/noty/jquery.noty", "lib/noty/themes/default", "lib/noty/layouts/topCenter"], function ($, Noty, Theme, Layout) {

    //http://needim.github.com/noty/
    $.noty.defaults = {
        layout       : 'topCenter',
        theme        : 'default',
        type         : 'alert',
        text         : '',
        dismissQueue : false, // If you want to use queue feature set this true
        template     : '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
        animation    : {
            open   : {height : 'toggle'},
            close  : {height : 'toggle'},
            easing : 'swing',
            speed  : 500 // opening & closing animation speed
        },
        timeout      : 2500, // delay for closing event. Set false for sticky notifications
        force        : false, // adds notification to the beginning of queue when set to true
        modal        : false,
        closeWith    : ['click', "hover"], // ['click', 'button', 'hover']
        callback     : {
            onShow     : function () {
            },
            afterShow  : function () {
            },
            onClose    : function () {
            },
            afterClose : function () {
            }
        },
        buttons      : false // an array of buttons
    };

    return {
        noty : window.noty
    }
});