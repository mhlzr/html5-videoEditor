var fs = require("fs"),
    wrench = require("wrench"),
    util = require("util"),
    uuid = require("node-uuid"),
    mongo = require("mongojs"),
    db = mongo.connect("/videoProjects", ["projects"]);


var PROJECTS_PATH = __dirname + "/public/projects/";


function createProject(req, res) {
    console.log("CREATE PROJECT");

    //UUID for asset-folder
    req.body.assetFolder = uuid.v4();

    db.projects.save(req.body, function saveCallback(err, docs) {

        if (err) throw err;

        res.writeHead(200, {"content-type":"application/json"});
        res.end(JSON.stringify(docs));

        console.log("Added New Project: ", docs._id)

        createDir(PROJECTS_PATH + req.body.assetFolder, function onComplete() {
            console.log("YEAH");
        });


    });

}
;


function getProject(req, res) {
    console.log("HERE");
    var id = req.params.id;

    res.writeHead(200, {"content-type":"application/json"});

    if (id.length !== 24) {
        res.end(JSON.stringify(null));
    }

    db.projects.findOne({_id:db.ObjectId(id)}, function onFound(err, docs) {
        console.log("FOUND: " + util.inspect(docs));
        res.end(JSON.stringify(docs));
    });

}
;

function updateProject(req, res) {

    db.projects.update({_id:db.ObjectId(req.params.id)}, {
        $set:{
            name:req.body.name,
            library:req.body.library,
            compositions:req.body.compositions
        }

    }, {multi:false}, function updateCallback(err, docs) {
        if (err) throw err;
        res.writeHead(200, {"content-type":"application/json"});
        res.end(JSON.stringify(docs));
        console.log("Updated Project: ", docs);
    });

}
;

function deleteProject(req, res) {
    var id = db.ObjectId(req.params.id),
        assetFolder = null;

    db.projects.findOne({_id:id}, {assetFolder:1}, function onFound(err, docs) {

        if (err) throw err;
        assetFolder = docs.assetFolder;

        db.projects.remove({_id:id}, function deleteCallback(err, docs) {
            if (err) throw err;
            res.writeHead(200, {"content-type":"application/json"});
            res.end(JSON.stringify(docs));

            deleteDirSync(PROJECTS_PATH + assetFolder);
        });

    });
}
;

function addAsset() {

}
;

function addComposition() {

}
;


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
            if (err) throw err;
            callback();
        });
    });
}
;


//EXPORTS
exports.createProject = createProject;
exports.getProject = getProject;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;