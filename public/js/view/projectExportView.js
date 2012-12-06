define(['underscore', 'backbone', 'jquery', 'hbs!templates/projectExport', 'qrcode'],

    function (_, Backbone, $, Template) {

        return Backbone.View.extend({

            events : {
                'click .okay' : 'confirmHandler'
            },

            render : function () {
                'use strict';

                this.$el.html(Template(_.extend(this.model.toJSON(), {url : window.location.href})));

                //generate QR-Code
                $('#qrcode').empty().qrcode(window.location.href);
            },

            confirmHandler : function (e) {
                'use strict';
                this.$el.trigger('reveal:close');
            }

        });

    })
;
