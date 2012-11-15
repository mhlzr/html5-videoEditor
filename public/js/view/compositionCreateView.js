define(['backbone', 'underscore', 'jquery', 'hbs!templates/compositionCreate'],

    function (Backbone, _, $, Template) {

        return Backbone.View.extend({

            initialize : function () {
                "use strict";

                _.bindAll(this, 'updateRatio');

                this.model.on('change:ratio', this.updateRatio);
            },

            events : {
                'click .okay'   : 'saveComposition',
                'click .cancel' : 'destroy',
                'change input'  : 'inputChangeHandler',
                'change select' : 'inputChangeHandler',
                'keyup input'   : 'inputChangeHandler'

            },

            render : function () {
                "use strict";
                this.$el.html(Template(this.model.toJSON()));
            },

            inputChangeHandler : function (e) {
                "use strict";

                var $target = $(e.target),
                    id = $target[0].id,
                    value = $target.val();

                if (id === 'presets') {
                    this.usePreset(value);
                }
                else {

                    //if value is numeric
                    if (!isNaN(parseInt(value))) {
                        value = parseInt(value);
                    }

                    this.model.set(id, value);
                }

            },


            usePreset : function (presetString) {
                "use strict";

                var $width = $('#width'),
                    $height = $('#height'),
                    result;

                //If custom, activate the buttons
                if (presetString === 'custom') {
                    $width.removeAttr('disabled');
                    $height.removeAttr('disabled');
                }

                else {
                    $width.attr('disabled', 'true');
                    $height.attr('disabled', 'true');

                    result = new RegExp(/([\d]+)x([\d]+)/g).exec(presetString);

                    this.model.set('width', parseInt(result[1]));
                    this.model.set('height', parseInt(result[2]));

                    //update the view, without rerendering
                    $width.val(this.model.get('width'));
                    $height.val(this.model.get('height'));
                }
            },

            updateRatio : function () {
                "use strict";
                $('#ratio').text(this.model.get('ratio'));
            },

            saveComposition : function () {
                "use strict";

                if (!this.model.isValid()) {
                    window.alert('Nope');
                    return;
                }

                //save the composition
                var model = this.model;
                model.save(null, {'success' : function () {
                    model.initServerUpdateListener();
                    app.project.get('compositions').add(model);
                }});

                this.destroy();
            },

            destroy : function () {
                "use strict";

                //Close Reveal modal
                this.$el.trigger('reveal:close');

                //remove from DOM
                this.remove();
            }
        });


    })
;
