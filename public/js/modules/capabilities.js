/**.
 * User: Matthieu Holzer
 * Date: 09.09.12
 * Time: 13:18
 */
define(["modernizr"], function (Modernizr) {
    var capabilities = {};

    capabilities.runBrowserSupportTest = function () {
               return true;
    };

    return capabilities;
});