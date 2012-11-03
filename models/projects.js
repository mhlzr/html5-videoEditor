var fs = require('fs'),
    wrench = require('wrench'),
    util = require('util'),
    uuid = require('node-uuid'),
    mongo = require('mongojs'),
    db = mongo.connect('/videoProjects', ['projects', 'files', 'assets', 'compositions', 'sequences']);

var PROJECTS_PATH = __dirname + '/../public/projects/';

function isProjectExistent(id, callback) {
    'use strict';

    if (!id || id.length < 24) {
        callback(false);
        return;
    }

    db.projects.findOne({_id : db.ObjectId(id)}, function onFound(err, docs) {
        callback(err === null);
    });
}

function getProjectPathByProjectId(id, callback) {
    'use strict';

    db.projects.findOne({_id : db.ObjectId(id)}, function onFound(err, docs) {
        if (err) {
            throw err;
        }
        callback(docs.assetFolder);
    });

}

function create(data, callback) {
    'use strict';

    //UUID for asset-folder
    data.assetFolder = uuid.v4().replace(/-/g, '');

    db.projects.save(data, function saveCallback(err, docs) {

            console.log('PROJECTS.JS::CREATED', docs._id);

            createDir(PROJECTS_PATH + data.assetFolder, function onComplete(err) {
                createDir(PROJECTS_PATH + data.assetFolder + '/assets', function onComplete(err) {
                    callback(err, {
                        _id         : docs._id,
                        assetFolder : docs.assetFolder
                    });
                });
            });
        }
    );
}

function read(data, callback) {
    'use strict';
    isProjectExistent(data._id, function (exists) {
            if (exists) {
                db.projects.findOne({_id : db.ObjectId(data._id)}, function onFound(err, docs) {
                    if (docs) {
                        console.log('PROJECTS.JS::FOUND', docs._id);
                        //didn't work this way
                        /* db.assets.find({projectId:data._id}, function onFound(err, assets){
                         docs.library = assets;
                         });*/
                    }
                    callback(err, docs);
                });
            }
            else {
                callback(new Error('Does not exist'), null);
            }
        }
    )
    ;

}

function update(data, callback) {
    'use strict';
    db.projects.update({_id : db.ObjectId(data._id)}, {
        $set : {
            title        : data.title,
            library      : data.library,
            compositions : data.compositions,
            assetFolder  : data.assetFolder,
            date         : data.date
        }

    }, {multi : false}, function updateCallback(err, docs) {
        console.log('PROJECTS.JS::UPDATED', data._id);
        callback(err, {});
    });

}

function remove(data, callback) {
    'use strict';

    var id = db.ObjectId(data._id),
        assetFolder = null;

    //to make sure nothing else gets deleted
    db.projects.findOne({_id : id}, {assetFolder : 1}, function onFound(err, docs) {
        assetFolder = docs.assetFolder;
        console.log(assetFolder);
        db.projects.remove({_id : id}, function deleteCallback(err, docs) {

            removeDirSync(PROJECTS_PATH + assetFolder);
            console.log('PROJECTS.JS::REMOVED', id);

            callback(err, docs);

        });

    });
}


function removeDirSync(path) {
    'use strict';
    wrench.rmdirSyncRecursive(path);
}

function createDir(path, callback) {
    'use strict';
    fs.exists(path, function onFileExists(exists) {
        if (!exists) fs.mkdir(path, parseInt('777', 8), function onDirCreated(err) {
            if (err) console.log(err);
            callback();
        });
    });
}

function clean(callback) {
    'use strict';
    console.log('PROJECTS.JS::PROJECTS CLEANED');
    db.projects.remove({});
    db.files.remove({});
    db.assets.remove({});
    db.sequences.remove({});
    db.compositions.remove({});
    wrench.rmdirSyncRecursive(PROJECTS_PATH);
    createDir(PROJECTS_PATH, callback);
}


//EXPORTS
exports.create = create;
exports.read = read;
exports.update = update;
exports.remove = remove;

exports.isProjectExistent = isProjectExistent;
exports.getProjectPathByProjectId = getProjectPathByProjectId;
exports.clean = clean;