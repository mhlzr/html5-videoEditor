/**.
 * User: Matthieu Holzer
 * Date: 19.09.12
 * Time: 17:11
 */
define('templates/helpers/has_not', ['handlebars'], function (Handlebars) {

    function has_not(context, options) {

        //TODO fix this
        /*
        for (var i = 0; i < context.length; i++) {
            if (context[i][options.hash.attr] === options.hash.value) {
                return null;
            }
        }                       */
        return options.fn(this);
    }

    Handlebars.registerHelper('has_not', has_not);

    return has_not;
});