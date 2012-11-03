var mongo = require('mongojs'),
    db = mongo.connect('/videoProjects', ['files']);

function create(data, callback) {
    'use strict';
    //this shouldn't be stored on the server
    delete data.localUrl;
    delete data.localFile;
    delete data.id;

    db.files.save(data, function saveCallback(err, docs) {
            console.log('FILES.JS::CREATED', docs._id);
            if (err) throw err;
            docs.id = docs._id;
            delete docs._id;
            callback(err, docs);
        }
    );
}

function read(data, callback) {
    'use strict';
    data._id = data.id;
    delete data.id;

    db.files.findOne({_id : db.ObjectId(data._id)}, function onFound(err, docs) {
        console.log('FILES.JS::FOUND', docs._id);
        if (err) throw err;
        callback(err, docs);
    });

}

function update(data, callback) {
    'use strict';
    var id = data.id,
        dataUpdate = {};

    //necessary because update could replace existing values
    if (data.assetId) dataUpdate.assetId = data.assetId;
    if (data.size) dataUpdate.size = data.size;
    if (data.ext) dataUpdate.ext = data.ext;
    if (data.remoteFileName) dataUpdate.remoteFileName = data.remoteFileName;
    if (data.isOriginal) dataUpdate.isOriginal = data.isOriginal;
    if (data.isComplete) dataUpdate.isComplete = data.isComplete;
    if (data.byteOffset) dataUpdate.byteOffset = data.byteOffset;
    if (data.encodingProgress) dataUpdate.encodingProgress = data.encodingProgress;


    db.files.update({_id : db.ObjectId(id)}, {$set : dataUpdate}, {multi : false},
        function updateCallback(err) {
            console.log('FILES.JS::UPDATED', id);
            if (err) throw err;
            callback(err, {});
        });
}

function remove(data, callback) {
    'use strict';

    var id = db.ObjectId(data.id),
        assetFolder = null;

    //to make sure nothing else gets deleted
    db.files.find({_id : id}, {files : 1}, function onFound(err, docs) {
        //TODO delete all files and remove from db
        //assetFolder = docs.assetFolder;
        db.files.remove({_id : id}, function deleteCallback(err, docs) {
            console.log('FILES.JS::REMOVED', id);
            callback(err, docs);

        });

    });
}

function getFilesByAssetId(data, callback) {
    'use strict';
    db.files.find({assetId : data.id}, function onFound(err, docs) {
        console.log('PROJECTS.JS::FILES SERVED WITH', docs.length, 'FILES');
        if (err) throw err;

        //the whole _id/id thing created a mess in the file-Model
        for (var i = 0; i < docs.length; i++) {
            docs[i].id = docs[i]._id;
            delete docs[i]._id;
        }

        callback(err, docs);
    });
}


function removeFile(filepath, callback) {
    'use strict';
    fs.exists(filepath, function onFileExists(exists) {
        if (!exists) fs.unlink(filepath, function onFileUnlink(err) {
            if (err) throw err;
            callback();
        });
    });
}


exports.create = create;
exports.read = read;
exports.update = update;
exports.remove = remove;

exports.getFilesByAssetId = getFilesByAssetId;