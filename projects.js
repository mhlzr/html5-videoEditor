var fs = require("fs"),
    wrench = require("wrench"),
    util = require("util"),
    uuid = require("node-uuid"),
    mongo = require("mongojs"),
    db = mongo.connect("/videoProjects", ["projects"]);

var PROJECTS_PATH = __dirname + "/public/projects/";

function createProject(data, callback) {
    var hasError,
        model = data.model;

    //UUID for asset-folder
    model.assetFolder = uuid.v4();

    db.projects.save(model, function saveCallback(err, docs) {

        console.log("PROJECTS.JS::PROJECT CREATED", docs._id);

        createDir(PROJECTS_PATH + model.assetFolder, function onComplete(err) {
            createDir(PROJECTS_PATH + model.assetFolder + "/assets", function onComplete(err) {
                callback({
                    id      : data.id,
                    payload : docs,
                    status  : err ? "error" : "success"
                });
            });
        });

    });

}

function readProject(data, callback) {
    var model = data.model;

    db.projects.findOne({_id : db.ObjectId(model._id)}, function onFound(err, docs) {
        console.log("PROJECTS.JS::PROJECT FOUND", docs._id);
        callback({
            id      : data.id,
            payload : docs,
            status  : err ? "error" : "success"
        });
    });

}

function getProjectPathByProjectId(id, callback) {

    db.projects.findOne({_id : db.ObjectId(id)}, function onFound(err, docs) {
        if (err) throw err;
        callback(docs.assetFolder);
    });

}

function updateProject(data, callback) {

    var model = data.model;

    db.projects.update({_id : db.ObjectId(model._id)}, {
        $set : {
            name         : model.name,
            library      : model.library,
            compositions : model.compositions
        }

    }, {multi : false}, function updateCallback(err, docs) {
        console.log("PROJECTS.JS::PROJECT UPDATED", model._id);
        callback({
            id      : data.id,
            payload : model,
            status  : err ? "error" : "success"
        });
    });

}

function deleteProject(data, callback) {

    var id = db.ObjectId(data.model._id),
        assetFolder = null;

    db.projects.findOne({_id : id}, {assetFolder : 1}, function onFound(err, docs) {

        assetFolder = docs.assetFolder;

        db.projects.remove({_id : id}, function deleteCallback(err, docs) {

            deleteDirSync(PROJECTS_PATH + assetFolder);
            console.log("PROJECTS.JS::PROJECT DELETED", id)

            callback({
                id      : data.id,
                payload : data.model,
                status  : err ? "error" : "success"
            });

        });

    });
}

function markAssetFileAsComplete(projectId, fileName) {

    db.projects.findOne({_id : db.ObjectId(projectId)}, {library : 1}, function onFound(err, docs) {

        if (err) console.log(err);
        //var file = docs.library;
        //TODO   update status of file
        console.log(util.inspect(docs));

    });
}

function addComposition() {

}

function deleteFile(filepath, callback) {
    fs.exists(filepath, function onFileExists(exists) {
        if (!exists) fs.unlink(filepath, function onFileUnlink(err) {
            if (err) throw err;
            callback();
        });
    });
}
;

function deleteDirSync(path) {
    wrench.rmdirSyncRecursive(path);
}

function createDir(path, callback) {
    fs.exists(path, function onFileExists(exists) {
        if (!exists) fs.mkdir(path, 0777, function onDirCreated(err) {
            if (err) console.log(err);
            callback();
        });
    });
}

function clean(callback) {
    console.log("PROJECTS.JS::PROJECTS CLEANED");
    db.projects.remove({}, function onRemoved() {
        wrench.rmdirSyncRecursive(PROJECTS_PATH);
        createDir(PROJECTS_PATH, callback);
    });
}

//EXPORTS
exports.createProject = createProject;
exports.readProject = readProject;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;

exports.markAssetFileAsComplete = markAssetFileAsComplete;
exports.getProjectPathByProjectId = getProjectPathByProjectId;
exports.clean = clean;