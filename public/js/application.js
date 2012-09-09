define([
    "jquery", "jstorage", "backbone", "modernizr", "router", "modules/capabilities", "modules/uploader.xhr2",
    "model/project", "view/libraryView", "model/asset", "model/video", "model/sequence"],

    function ($, jStorage, Backbone, Modernizr, Router, Capabilities, Uploader, ProjectModel, LibraryView, AssetModel, VideoModel, SequenceModel) {

        var Application = Application || {};

        Application.device = Application.device || {};
        Application.project = Application.project || {};
        Application.views = Application.views || {};
        Application.router = Application.router || {};
        Application.uploader = Uploader;
        Application.capabilities = Capabilities;


        Application.initialize = function () {

            console.log("APPLICATION::INIT");

            if(!Capabilities.runBrowserSupportTest){
                console.log("Your browser is not supported");
                return;
            }

            this.router = new Router({
                application : this
            });

            Backbone.setDomLibrary($);
            Backbone.history.start({
                pushState:true
            });

            this.getAvailableProjectsFromLocalStorage();
            this.project = new ProjectModel();

            /*


             this.views.library = new LibraryView({
             collection: this.project.get("library"),
             el: $("#library")
             });

             */

            //_.bindAll(this.get("project"), this.projectChangeHandler );

            $("button").on("click", this.buttonHandler);

           //TODO ONLY FOR TESTING UPLOAD!!     REMOVE THIS
            $("#uploadInput").on("change", uploadInputChangeHandler);
            $("#startBtn").on("click", Application.uploader.start );
            $("#stopBtn").on("click", Application.uploader.stop);

            //no jquery here
            //window.onbeforeunload = this.controller.windowEventHandler;
            //window.onunload = this.controller.windowEventHandler;

        };


        Application.projectChangeHandler = function (e) {
            console.log(e);
        };

        Application.getAvailableProjectsFromLocalStorage = function () {
            var localProjects = $.jStorage.index(),
                outputList = $("#availableProjects");

            var currentProj;

            for (var i = 0; i < localProjects.length; i++) {
                currentProj = $.jStorage.get(localProjects[i]);
                outputList.append("<li>" + localProjects[i] + ", " + currentProj.name + ", " + currentProj.date + "</li>");

            }
        };

        Application.buttonHandler = function (e) {


            var project = Application.project;

            switch (e.target.id) {

                case "dumpProject" :
                    console.log(project.toJSON());
                    $("#output").text(JSON.stringify(project.toJSON()));
                    break;
                case "saveLocalBtn":
                    console.log(project.get("_id"));
                    $.jStorage.set(project.get("_id"), {
                        name:project.get("name"),
                        date:project.get("date")
                    });
                    break;

                case "fetchBtn":
                    project.fetch();
                    break;

                case "clearLocalBtn":
                    $.jStorage.flush();
                    break;
                case "projectSyncBtn":
                    Backbone.sync;
                    break;
                case "saveBtn":
                    project.save();
                    break;
                case "deleteBtn":
                    project.destroy();
                    break;

                case "addAssetToLibBtn":
                    console.log("ADDING ASSET");
                    project.get("library").add(new VideoModel());
                    break;

                case "addSequenceToCompBtn":
                    console.log("ADDING SEQUENCE");
                    project.get("compositions").add(new SequenceModel());
            }

        };


        /*
         controller.windowEventHandler = function(e){

         if(e.type === "beforeunload" || e.type === "unload"){
         return "There are still some uploads pending ...";
         }

         }
         */

        return Application;

    })