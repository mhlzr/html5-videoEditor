require.config({

    "paths":{
        "underscore":"lib/underscore-min",
        "backbone":"lib/backbone-min",
        "backbone-rel":"lib/backbone-relational",
        "jquery":"lib/jquery-1.8.1.min",
        "json2":"lib/json2",
        "jstorage":"lib/jstorage",
        "modernizr":"lib/modernizr-2.6.2",
        "handlebars":"lib/handlebars-1.0.0.beta.6",
        "binary":"lib/binary.js",
        "app":"application"
    },

    "shim":{
        backbone:{
            "deps":["jquery", "underscore"],
            "exports":"Backbone"
        },

        underscore:{
            "exports":"_"
        }
    }
});


require(["jquery", "underscore", "backbone", "app"],

    function ($, _, Backbone, Application) {
        window.Application = Application;

        Application.initialize();
    });