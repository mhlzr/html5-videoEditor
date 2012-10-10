var fs = require("fs"),
    wrench = require("wrench"),
    util = require("util"),
    uuid = require("node-uuid"),
    mongo = require("mongojs"),
    db = mongo.connect("/videoProjects", ["projects"]);

var PROJECTS_PATH = __dirname + "/public/projects/";

function isProjectExistent(id, callback) {

    if (!id || id.length < 24) {
        //TODO check this
        //callback(false);
        return;
    }

    db.projects.findOne({_id : db.ObjectId(id)}, function onFound(err, docs) {
        callback(err === null);
    });
}

function getProjectPathByProjectId(id, callback) {

    db.projects.findOne({_id : db.ObjectId(id)}, function onFound(err, docs) {
        if (err) throw err;
        callback(docs.assetFolder);
    });

}

function createProject(data, callback) {

    //UUID for asset-folder
    data.assetFolder = uuid.v4().replace(/-/g, '');

    db.projects.save(data, function saveCallback(err, docs) {

            console.log("PROJECTS.JS::PROJECT CREATED", docs._id);

            createDir(PROJECTS_PATH + data.assetFolder, function onComplete(err) {
                createDir(PROJECTS_PATH + data.assetFolder + "/assets", function onComplete(err) {
                    callback(err, {
                        _id         : docs._id,
                        assetFolder : docs.assetFolder
                    });
                });
            });
        }
    );
}

function readProject(data, callback) {
    isProjectExistent(data._id, function (exists) {
        if (exists) {
            db.projects.findOne({_id : db.ObjectId(data._id)}, function onFound(err, docs) {
                if (docs) {
                    console.log("PROJECTS.JS::PROJECT FOUND", docs._id);
                }
                callback(err, docs);
            });
        }
        else {
            callback('Does not exist', null);
        }
    });

}

function updateProject(data, callback) {

    db.projects.update({_id : db.ObjectId(data._id)}, {
        $set : {
            title        : data.title,
            library      : data.library,
            compositions : data.compositions,
            assetFolder  : data.assetFolder,
            date         : data.date
        }

    }, {multi : false}, function updateCallback(err, docs) {
        console.log("PROJECTS.JS::PROJECT UPDATED", data._id);
        callback(err, {});
    });

}

function deleteProject(data, callback) {

    var id = db.ObjectId(data._id),
        assetFolder = null;

    //to make sure nothing else gets deleted
    db.projects.findOne({_id : id}, {assetFolder : 1}, function onFound(err, docs) {
        assetFolder = docs.assetFolder;
        db.projects.remove({_id : id}, function deleteCallback(err, docs) {

            deleteDirSync(PROJECTS_PATH + assetFolder);
            console.log("PROJECTS.JS::PROJECT DELETED", id);

            callback(err, docs);

        });

    });
}

function createAsset(data, callback) {
    db.projects.save(data, function saveCallback(err, docs) {
            console.log("PROJECTS.JS::ASSET CREATED", docs._id);
            if (err) throw err;
            callback(err, docs);
        }
    );
}

function readAsset(data, callback) {
    db.projects.findOne({_id : db.ObjectId(data._id)}, function onFound(err, docs) {
        console.log("PROJECTS.JS::ASSET FOUND", docs._id);
        if (err) throw err;
        callback(err, docs);
    });

}

function updateAsset(data, callback) {
    var id = data._id;
    delete data._id;
    db.projects.update({_id : db.ObjectId(id)}, data, {multi : false},
        function updateCallback(err, docs) {
            data._id = id;
            console.log("PROJECTS.JS::ASSET UPDATED", id);
            if (err) throw err;
            callback(err, {});
        }

    )
    ;

}

function deleteAsset(data, callback) {

    var id = db.ObjectId(data._id),
        assetFolder = null;

    //to make sure nothing else gets deleted
    db.projects.find({_id : id}, {files : 1}, function onFound(err, docs) {
        //TODO delete all files and remove from db
        //assetFolder = docs.assetFolder;
        db.projects.remove({_id : id}, function deleteCallback(err, docs) {
            console.log("PROJECTS.JS::ASSET DELETED", id);
            if (err) throw err;
            callback(err, docs);

        });

    });
}

function createFile(data, callback) {
    db.projects.save(data, function saveCallback(err, docs) {
            console.log("PROJECTS.JS::FILE CREATED", docs._id);
            if (err) throw err;
            callback(err, docs);
        }
    );
}

function readFile(data, callback) {
    db.projects.findOne({_id : db.ObjectId(data._id)}, function onFound(err, docs) {
        console.log("PROJECTS.JS::FILE FOUND", docs._id);
        if (err) throw err;
        callback(err, docs);
    });

}

function updateFile(data, callback) {
    var id = data._id;
    delete data._id;

    db.projects.update({_id : db.ObjectId(data._id)}, data, {multi : false},
        function updateCallback(err, docs) {
            console.log("PROJECTS.JS::FILE UPDATED", id);
            if (err) throw err;
            callback(err, {});
        });
}

function deleteFile(data, callback) {

    var id = db.ObjectId(data._id),
        assetFolder = null;

    //to make sure nothing else gets deleted
    db.projects.find({_id : id}, {files : 1}, function onFound(err, docs) {
        //TODO delete all files and remove from db
        //assetFolder = docs.assetFolder;
        db.projects.remove({_id : id}, function deleteCallback(err, docs) {
            console.log("PROJECTS.JS::FILE DELETED", id);
            callback(err, docs);

        });

    });
}

function removeFile(filepath, callback) {
    fs.exists(filepath, function onFileExists(exists) {
        if (!exists) fs.unlink(filepath, function onFileUnlink(err) {
            if (err) throw err;
            callback();
        });
    });
}

function removeDirSync(path) {
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

exports.createAsset = createAsset;
exports.readAsset = readAsset;
exports.updateAsset = updateAsset;
exports.deleteAsset = deleteAsset;

exports.createFile = createFile;
exports.readFile = readFile;
exports.updateFile = updateFile;
exports.deleteFile = deleteFile;

exports.isProjectExistent = isProjectExistent;
exports.getProjectPathByProjectId = getProjectPathByProjectId;
exports.clean = clean;