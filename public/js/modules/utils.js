/**
 * User: Matthieu Holzer
 * Date: 21.10.12
 * Time: 20:28
 */
define(function () {

    Math.roundDec = function (n, dec) {
        return Math.round(n * Math.pow(10, 2)) / Math.pow(10, 2);
    }

});