require.config({

    'locale' : 'de_de',

    'paths' : {
        'underscore'                 : 'lib/underscore-min',
        'backbone'                   : 'lib/backbone-min',
        'backbone-rel'               : 'lib/backbone-relational',
        'backbone-model-binder'      : 'lib/Backbone.ModelBinder.min',
        'backbone-collection-binder' : 'lib/Backbone.CollectionBinder.min',
        'jquery'                     : 'lib/jquery-1.8.1',
        'json2'                      : 'lib/json2',
        'jstorage'                   : 'lib/jstorage',
        'socket'                     : 'lib/socket.io',
        'modernizr'                  : 'lib/modernizr-2.6.2',
        'hbs'                        : 'lib/hbs',
        'handlebars'                 : 'lib/handlebars',
        'i18nprecompile'             : 'lib/i18nprecompile',
        'app'                        : 'application',
        'config'                     : 'config',
        'info'                       : 'modules/info'
    },

    'hbs' : {
        templateExtension : 'template',
        disableI18n       : true
    },

    'shim' : {
        'backbone' : {
            'deps'    : ['jquery', 'underscore'],
            'exports' : 'Backbone'
        },

        'backbone-collection-binder' : {
            'deps' : ['backbone-model-binder']
        },

        'backbone-rel' : {
            'deps' : ['backbone']
        },

        'info' : {
            deps : ['jquery']
        },

        'jstorage' : {
            deps : ['jquery']
        },

        'underscore' : {
            'exports' : '_'
        },

        'socket' : {
            'exports' : function () {
                return window.io;
            }
        }
    }
});

require(['app'],

    function (Application) {

        window.app = Application;
        window.app.initialize();

        Backbone.history.start({
            pushState : true
        });

    });