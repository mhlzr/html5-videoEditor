/**.
 * User: Matthieu Holzer
 * Date: 14.09.12
 * Time: 17:11
 */
define('templates/helpers/roundNumber', ['handlebars'], function (Handlebars) {

    function roundNumber(item, options) {

        return Math.round(item * Math.pow(10, 2)) / Math.pow(10, 2)
    }

    Handlebars.registerHelper('roundNumber', roundNumber);

    return roundNumber;
});