/**.
 * User: Matthieu Holzer
 * Date: 14.09.12
 * Time: 17:11
 */
define('template/helpers/list', ['handlebars'], function (Handlebars) {

        function list(items, options) {
            var out = "<ul>";

            for (var i = 0, l = items.length; i < l; i++) {
                out = out + "<li>" + options.fn(items[i]) + "</li>";
            }

            return out + "</ul>";

        }

        Handlebars.registerHelper('list', list);

        return list;
    }

)
;