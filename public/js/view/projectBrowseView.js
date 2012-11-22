define(['underscore', "backbone", "jquery", 'hbs!templates/projectBrowser', 'model/project'],

    function (_, Backbone, $, Template, ProjectModel) {

        return Backbone.View.extend({

            //couldm't get this view to work with a form and submit-button
            //the submit event never got prevented, so now pressing enter
            //will do nothing :(

            initialize : function () {
                "use strict";
            },

            render : function () {
                "use strict";

                var availableProjects = app.device.getAvailableProjectsFromLocalStorage(),
                    data = _.extend(this.model.toJSON(), {
                            cancellable       : this.cancellable,
                            availableProjects : availableProjects}
                    );

                this.$el.html(Template(data));

                if (availableProjects.length === 0) {
                    //could have been done in the template,
                    //but it can be changed later in this view here
                    //and the view shouldnt be rerendered
                    this.setExistentProjectsViewToDefault();
                }

            },

            events : {
                'click .okay'               : 'createOrSelectProject',
                'touchend .okay'            : 'createOrSelectProject',
                'click .cancel'             : 'destroy',
                'click .remove'             : 'destroyProject',
                'click input[name=type]'    : 'typeChangeHandler',
                'click input[name=project]' : 'projectSelectHandler',
                'keyup #projectTitle'       : 'projectTitleChange'
            },

            typeChangeHandler : function (e) {
                "use strict";

                var value = $(e.target).val(),
                    $projectTitle = $('#projectTitle'),
                    $removeButtons = $('.remove'),
                    $projectCheckboxes = $('input[name=project]');

                //existent
                if (value === 'existent') {

                    //disabling the fieldset didn't work in FF
                    $projectTitle.attr('disabled', 'disabled');
                    $removeButtons.removeAttr('disabled');
                    $projectCheckboxes.removeAttr('disabled');

                    //check if some radio input selected
                    this.toggleConfirmButtonState($('li input:checked').length > 0);
                }
                //new
                else {
                    $projectTitle.removeAttr('disabled');
                    $projectCheckboxes.attr('disabled', 'disabled');
                    $removeButtons.attr('disabled', 'disabled');

                    //check if title set
                    this.toggleConfirmButtonState($projectTitle.val().length >= 3);
                }
            },


            projectSelectHandler : function (e) {
                "use strict";
                var $selected = $(e.target).parent(); //li > input
                $('li').removeClass('selected');
                $selected.addClass('selected');

                this.toggleConfirmButtonState(true);
            },

            projectTitleChange : function (e) {
                "use strict";
                var value = $(e.target).val();

                this.model.set('title', value);
                this.toggleConfirmButtonState(value.length >= 3);
            },

            toggleConfirmButtonState : function (state) {
                "use strict";
                var $confButton = $('.okay');

                if (state) $confButton.removeAttr('disabled');
                else $confButton.attr('disabled', 'true');

            },

            createOrSelectProject : function (e) {
                "use strict";

                var self = this,
                    isNew = $('#radioNew:checked').length === 1;

                //user creates a new project
                if (isNew) {
                    //current model is not new-->create a new one
                    if (!this.model.isNew()) {
                        this.model = new ProjectModel({
                            title : $('#projectTitle').val()
                        });
                        this.model.save({}, {'success' : function onSuccess() {
                            app.device.saveProjectToLocalStorage(self.model.id, self.model.get('title'), self.model.get('date'));
                            app.router.navigate('' + self.model.id, {trigger : true, replace : true});
                            self.destroy();
                        }});
                    }
                    //current model is new
                    else {
                        this.model.save({}, {'success' : function onSuccess() {
                            app.device.saveProjectToLocalStorage(self.model.id, self.model.get('title'), self.model.get('date'));
                            app.router.navigate('' + self.model.id, {trigger : true, replace : true});
                            self.destroy();
                        }});
                    }
                }
                //user chose existing project
                else {
                    this.model.set('_id', $('li.selected input').val());
                    app.router.navigate('' + self.model.id, {trigger : true, replace : true});
                    self.destroy();
                }

            },


            destroyProject : function (e) {
                "use strict";

                var confirm = window.confirm('Are you sure you want to delete this project completely?'),
                    $target = $(e.target),
                    id = $target.attr('data-id'),
                    $parent = $target.parent();

                if (!confirm) return;

                //if this one was selected
                if ($parent.hasClass('selected')) {
                    this.toggleConfirmButtonState(false);
                }

                //remove locally
                app.device.removeProjectFromLocalStorage(id);

                //delete project on server-side
                this.model.set('_id', id, {silent : true});
                this.model.destroy();

                //remove from DOM, without rerendering
                $parent.remove();

                //check if there are any projects left
                if (this.$el.find('li').length < 1) {
                    //activate newProject option
                    $('#radioNew').trigger('click');
                    this.setExistentProjectsViewToDefault();
                }
            },

            setExistentProjectsViewToDefault : function () {
                "use strict";
                $('#existentProject').append('<span>No projects available.</span>').find('ul').remove();
            },

            destroy : function () {
                "use strict";
                //Close Reveal modal
                this.$el.trigger('reveal:close');
                //remove from DOM
                this.remove();
            }

        })
            ;

    })
;
