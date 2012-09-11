/**.
 * User: Matthieu Holzer
 * Date: 11.09.12
 * Time: 12:51
 */
define(["underscore"], function (_) {

    var reg = {
        lastId    : 0,
        callbacks : [],

        addCallback : function (options) {
            this.lastId++;
            this.callbacks[this.lastId] = {
                "success" : options.success,
                "error"   : options.error
            };
            return this.lastId;
        },

        execCallbackById : function (data) {
            if (this.callbacks[data.id]) {
                var func = (data.status === "success") ? this.callbacks[data.id].success : this.callbacks[data.id].error;
            }
            if (_.isFunction(func)) {
                func(data.payload);
                delete(this.callbacks[data.id]);
            }
        }
    }

    return reg;
})
;