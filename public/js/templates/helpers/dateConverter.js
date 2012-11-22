/**
 * User: Matthieu Holzer
 * Date: 22.11.12
 * Time: 14:45
 */
define('templates/helpers/dateConverter', ['handlebars', 'utils'], function (Handlebars, Utils) {


    var dateConverter = function (item, options) {
        return Utils.getReadableDate(item);
    };

    Handlebars.registerHelper('dateConverter', dateConverter);

    return dateConverter;
});