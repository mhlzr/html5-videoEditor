/**.
 * User: Matthieu Holzer
 * Date: 14.09.12
 * Time: 17:11
 */
define('templates/helpers/roundNumber', ['handlebars', 'utils'], function (Handlebars) {


    var roundNumber = function (item, options) {
        return Math.roundDec(item);
    };

    Handlebars.registerHelper('roundNumber', roundNumber);

    return roundNumber;
});