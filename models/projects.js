var fs = require('fs'),
    wrench = require('wrench'),
    uuid = require('node-uuid'),
    mongo = require('mongojs'),
    db = mongo.connect('/videoProjects', ['projects']),
    assets = null,
    compositions = null;


exports.init = function (assets, compositions, projectsPath, assetPath) {
    "use strict";

    this.assets = assets;
    this.compositions = compositions;
    this.projectsPath = projectsPath;
    this.assetPath = assetPath;

    return this;
};


exports.isProjectExistent = function (id, callback) {
    'use strict';

    if (!id || id.length < 24) {
        callback(false);
        return;
    }

    db.projects.findOne({_id : db.ObjectId(id)}, function onFound(err, docs) {
        callback(err === null);
    });
};


exports.getProjectPathByProjectId = function (id, callback) {
    'use strict';

    db.projects.findOne({_id : db.ObjectId(id)}, function onFound(err, docs) {
        if (err) {
            throw err;
        }

        if (!docs) {
            callback(null);
            return;
        }
        callback(docs.assetFolder);
    });

};

exports.create = function (data, callback) {
    'use strict';

    //UUID for asset-folder
    data.assetFolder = uuid.v4().replace(/-/g, '');

    db.projects.save(data, function saveCallback(err, docs) {

            console.log('PROJECTS.JS::CREATED', docs._id);

            createDir(exports.projectsPath + data.assetFolder, function onComplete(err) {
                createDir(exports.projectsPath + data.assetFolder + exports.assetPath, function onComplete(err) {
                    callback(err, {
                        _id         : docs._id,
                        assetFolder : docs.assetFolder
                    });
                });
            });
        }
    );
};

exports.read = function (data, callback) {
    'use strict';
    exports.isProjectExistent(data._id, function (exists) {
            if (exists) {
                db.projects.findOne({_id : db.ObjectId(data._id)}, function onFound(err, docs) {
                    if (docs) {
                        console.log('PROJECTS.JS::FOUND', docs._id);
                    }
                    callback(err, docs);
                });
            }
            else {
                callback(new Error('Does not exist'), null);
            }
        }
    );
};

exports.update = function (data, callback) {
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

};

exports.remove = function (data, callback) {
    'use strict';

    var id = db.ObjectId(data._id),
        assetFolder = null;

    //find by id
    db.projects.findOne({_id : id}, function onFound(err, docs) {

        if (!docs) {
            callback(err, docs);
            return;
        }

        assetFolder = docs.assetFolder;

        //delete
        db.projects.remove({_id : id}, function onRemoved(err, docs) {

            //delete all files & folders that belong to the project
            if (assetFolder) {
                try {
                    wrench.rmdirSyncRecursive(exports.projectsPath + assetFolder);
                } catch (e) {
                    callback(err, docs);
                }
            }

            console.log('PROJECTS.JS::REMOVED', id);
            callback(err, docs);

        });

    });

};


function createDir(path, callback) {
    'use strict';
    fs.exists(path, function onFileExists(exists) {
        if (!exists) fs.mkdir(path, parseInt('777', 8), function onDirCreated(err) {
            if (err) console.log(err);
            callback();
        });
    });
}


