require.config({

    'locale' : 'en_us',

    'paths' : {
        'underscore'          : 'lib/underscore',
        'backbone'            : 'lib/backbone',
        'backbone-rel'        : 'lib/backbone-relational',
        'backbone-m-binder'   : 'lib/Backbone.ModelBinder.min',
        'backbone-c-binder'   : 'lib/Backbone.CollectionBinder.min',
        'backbone-bind'       : 'lib/backbone.iobind',
        'backbone-sync'       : 'lib/backbone.iosync',
        'jquery'              : 'lib/jquery-1.8.1',
        'jquery-ui'           : 'lib/jquery-ui-1.9.2.custom',
        'jquery-ui-rotatable' : 'lib/jquery.ui.rotatable',
        'jquery++'            : 'lib/jquerypp',
        'jquery-mousewheel'   : 'lib/jquery.mousewheel',
        'jquery-scrollTo'     : 'lib/jquery.scrollTo',
        'json2'               : 'lib/json2',
        'jstorage'            : 'lib/jstorage',
        'toe'                 : 'lib/toe.built',
        'qrcode'              : 'lib/jquery.qrcode.min',
        'socket'              : 'lib/socket.io',
        'screenfull'          : 'lib/screenfull',
        'modernizr'           : 'lib/modernizr-2.6.2',
        'hbs'                 : 'lib/hbs',
        'handlebars'          : 'lib/handlebars',
        'i18nprecompile'      : 'lib/i18nprecompile',
        'app'                 : 'application',
        'config'              : 'config',
        'controller'          : 'controller',
        'info'                : 'modules/info',
        'device'              : 'modules/device',
        'utils'               : 'modules/utils'
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

        'backbone-bind' : {
            'deps' : ['backbone', 'underscore']
        },

        'backbone-sync' : {
            'deps' : ['backbone', 'underscore']
        },

        'modernizr' : {
            'exports' : function () {
                return window.Modernizr
            }
        },

        'screenfull' : {
            'exports' : function () {
                return window.screenfull
            }
        },

        'info' : {
            deps : ['jquery']
        },

        'jquery-ui' : {
            deps : ['jquery']
        },

        'jquery-ui-rotatable' : {
            deps : ['jquery-ui', 'jquery']
        },

        'jquery++' : {
            deps : ['jquery']
        },

        'jquery-mousewheel' : {
            deps : ['jquery']
        },

        'jquery-scrollTo' : {
            deps : ['jquery']
        },

        'toe' : {
            deps : ['jquery']
        },

        'jstorage' : {
            deps : ['jquery']
        },

        'qrcode' : {
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

require(['app', 'socket', 'utils'],

    function (Application, Socket) {

        window.socket = Socket;
        window.app = Application;
        window.app.initialize(window.socket);

    });