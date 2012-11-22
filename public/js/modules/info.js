/**.
 * User: Matthieu Holzer
 * Date: 11.09.12
 * Time: 17:41
 */
define(['jquery', 'lib/jquery.reveal'], function ($) {


    //http://www.zurb.com/playground/reveal-modal-plugin
    var reveal = function ($el, options) {


        $el.css('display', 'block').reveal(
            {
                animation              : options.animation || 'fadeAndPop', //fade, fadeAndPop, none
                animationspeed         : options.animationspeed || 300, //how fast animtions are
                closeonbackgroundclick : options.closeonbackgroundclick === undefined ? true : options.closeonbackgroundclick, //if you click background will modal close?
                dismissmodalclass      : options.dismissmodalclass || 'close-reveal-modal'    //the class of a button or element that will close an open modal
            }
        );

    };

    return {
        reveal : reveal
    }
});