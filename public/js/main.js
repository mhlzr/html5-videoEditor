require.config({

    "paths" : {
        "underscore"       : "lib/underscore-min",
        "backbone"         : "lib/backbone-min",
        "backbone-rel"     : "lib/backbone-relational",
        "jquery"           : "lib/jquery-1.8.1",
        "json2"            : "lib/json2",
        "jstorage"         : "lib/jstorage",
        "modernizr"        : "lib/modernizr-2.6.2",
        "handlebars"       : "lib/handlebars-1.0.0.beta.6",
        "app"              : "application",
        "config"           : "config"
    },

    "shim" : {
        "backbone" : {
            "deps"    : ["jquery", "underscore"],
            "exports" : "Backbone"
        },

        "underscore" : {
            "exports" : "_"
        }
    }
});

require(["jquery", "underscore", "backbone", "app"],

    function ($, _, Backbone, Application) {

        window.app = Application;
        window.app.initialize();

    });