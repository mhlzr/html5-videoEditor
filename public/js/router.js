define(['backbone', 'model/project'],

    function (Backbone, ProjectModel) {

        var Router = Backbone.Router.extend({

                routes : {
                    ':id'         : 'editor', // /#500da18fd35e9cfc0e00000e
                    'preview/:id' : 'preview', // /#preview/500da18fd35e9cfc0e00000e
                    '*actions'    : 'default' // default
                },

                editor : function (query, page) {
                    //http://stackoverflow.com/questions/11985228/mongodb-node-check-if-objectid-is-valid
                    if (/^[0-9a-fA-F]{24}$/.test(query)) {
                        app.project.set('_id', query);

                        if (app.project.isNew()) return;

                        //until socket isn't initialized this would throw an error
                        var repeat = window.setInterval(function () {
                            app.project.fetch({
                                    'error'   : function (err) {
                                        console.log('ROUTER.JS::CANT FETCH!');
                                    },
                                    'success' : function () {
                                        app.project.get('library').fetch({'data' : { 'id' : app.project.id }, 'success' : function () {
                                            app.project.get('compositions').fetch({'data' : { 'id' : app.project.id }, 'success' : function () {
                                                app.views.renderAll();

                                            }});
                                        }});
                                        window.clearInterval(repeat);
                                    }
                                }
                            )
                            ;
                        }, 100);
                    }


                },

                preview : function (query, page) {
                    // this.navigate()'/preview/#' + query; //node will handle this
                },

                default : function (actions) {
                }

            })
            ;

        return Router;

    })
;