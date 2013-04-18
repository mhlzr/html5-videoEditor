/**.
 * User: Matthieu Holzer
 * Date: 19.09.12
 * Time: 17:11
 */
define('templates/helpers/unless_eq', ['handlebars'], function (Handlebars) {

    function unless_eq(context, options) {
        if (context == options.hash.compare)
            return options.inverse(this);
        return options.fn(this);
    }

    Handlebars.registerHelper('unless_eq', unless_eq);
    return unless_eq;

});