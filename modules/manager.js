var fs = require('fs'),
    mongo = require('mongojs'),
    db = mongo.connect('/videoProjects', ['projects', 'assets', 'compositions', 'files', 'sequences']),
    wrench = require('wrench');

var PROJECTS_PATH = __dirname + '/../public/projects/',
    ASSETS_SUBDIR = '/assets/',
    COMPOSITIONS_SUBDIR = '/compositions';

/**
 * Used to simplify  the access to the database
 * and the file-system, it's like a wrapper for
 * all the model-CRUDs
 *
 * This way each document can access its subdocuments, even if those
 * are in a different database.
 */

exports.createManager = function () {
    'use strict';

    this.files = require('./../models/files');
    this.sequences = require('./../models/sequences');
    this.assets = require('./../models/assets').init(this.files);
    this.compositions = require('./../models/compositions').init(this.files, this.sequences);
    this.projects = require('./../models/projects').init(this.assets, this.compositions, PROJECTS_PATH, ASSETS_SUBDIR, COMPOSITIONS_SUBDIR);

    return this;

};


/**
 * Builds an absolute Path for a project, where
 * the files should be stored
 *
 * @param projectDir String
 * @param fileName String (optional)
 * @return {String} absolute Path
 */

exports.getAbsoluteFilePath = function (projectDir, fileName) {
    if (!fileName) return PROJECTS_PATH + projectDir + ASSETS_SUBDIR;
    else return PROJECTS_PATH + projectDir + ASSETS_SUBDIR + fileName;
};


/**
 * This is the handler if a file:delete request arrives
 * the physical file needs to get deleted as well,
 * but before the db-entry is removed
 *
 * @param data Object (needed id || _id, fileName)
 */
exports.removePhysicalFile = function (data, callback) {
    'use strict';

    var fileId = data.id,
        fileName = data.fileName,
        projectId,
        projectPath;

    //get the projectId via asset
    exports.assets.getAssetByFileId(fileId, function onFound(asset) {

        //if the asset is already removed from the db, we won't get any id
        //so we can just go on, leaving the file on the disk
        if (!asset || !asset.projectId) {
            callback();
            return;
        }

        projectId = asset.projectId;

        //get the projectPath via projectId
        exports.projects.getProjectPathByProjectId(projectId, function onPathFound(path) {

            //if the project is already removed from the db
            if (!path) {
                callback();
                return;
            }

            projectPath = path;

            //delete physical file
            fs.exists(exports.getAbsoluteFilePath(projectPath, fileName), function onFileExists(exists) {
                if (!exists) fs.unlink(exports.getAbsoluteFilePath(projectPath, fileName), function onFileUnlink(err) {
                    if (err) throw err;
                    callback(data);
                });
            });


        });

    });
};

/**
 * Accepts the data-chunks that come in via socket.io
 * and appends them the physical storage
 *
 * @param data - Object (needed: bytes, fileName, byteOffset, bytesTotal)
 * @param projectPath - String project-specific folderName
 * @param callback
 */

exports.acceptFilePartial = function (data, projectPath, callback) {

    var response,
        filePath;

    if (!data.fileName || !data.bytes || isNaN(data.byteOffset) || !data.bytesTotal) {
        throw new Error('Missing or false parameters');
    }

    filePath = exports.getAbsoluteFilePath(projectPath, data.fileName);

    //open the file and append the bytes
    fs.open(filePath, 'a', function (err, fd) {

        if (err) {
            throw err;
        }

        var buffer = new Buffer(data.bytes, 'base64'),
            pos = parseInt(data.byteOffset),
            isComplete = false;

        fs.write(fd, buffer, 0, buffer.length, pos, function (err, written, buffer) {

            if (err) {
                throw err;
            }

            fs.close(fd, function (err) {

                isComplete = pos + buffer.length === parseInt(data.bytesTotal);

                response = {
                    'isComplete' : isComplete,
                    'id'         : data.id,
                    'projectId'  : data.projectId,
                    'byteOffset' : pos + buffer.length
                };

                if (isComplete) {
                    console.log('MGR: UPLOAD COMPLETE', data.fileName);
                }

                callback(response);

            });

        });

    });

};

/**
 * Removed all userData from the database and filesystem
 * should be deactivated if someone wanted to use this in production-mode
 * @param callback
 */

exports.clean = function (callback) {
    'use strict';

    console.log('PROJECTS.JS::PROJECTS CLEANED');

    //empty all db-collections
    db.projects.remove({});
    db.files.remove({});
    db.assets.remove({});
    db.sequences.remove({});
    db.compositions.remove({});

    try {

        //remove the projects folder and it's content
        wrench.rmdirSyncRecursive(PROJECTS_PATH);

        //check if folder exists
        var exists = fs.existsSync(PROJECTS_PATH);

        //recreate the just removed dir
        if (!exists) {
            fs.mkdirSync(PROJECTS_PATH, parseInt('777', 8));
        }

        callback();
    }

    catch (e) {
        callback();
    }
};


