/**.
 * User: Matthieu Holzer
 * Date: 19.09.12
 * Time: 17:11
 */
define('templates/helpers/has_not', ['underscore', 'handlebars'], function (_, Handlebars) {

    function has_not(context, options) {

        var result = _.filter(context, function (el) {
            return el === options.hash.value;
        });

        if (result.length > 0) return options.inverse(this);
        else return options.fn(this);
    }

    Handlebars.registerHelper('has_not', has_not);

    return has_not;
});