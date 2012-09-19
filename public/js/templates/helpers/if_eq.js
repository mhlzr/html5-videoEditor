/**.
 * User: Matthieu Holzer
 * Date: 19.09.12
 * Time: 17:11
 */
define('templates/helpers/if_eq', ['handlebars'], function (Handlebars) {

    function if_eq(context, options) {
        if (context == options.hash.compare)
            return options.fn(this);
        return options.inverse(this);
    }

    Handlebars.registerHelper('if_eq', if_eq);

    return if_eq;
});
