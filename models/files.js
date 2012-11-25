var mongo = require('mongojs'),
    db = mongo.connect('/videoProjects', ['files']),
    fs = require('fs');


exports.create = function (data, callback) {
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
};

exports.read = function (data, callback) {
    'use strict';
    data._id = data.id;
    delete data.id;

    db.files.findOne({_id : db.ObjectId(data._id)}, function onFound(err, docs) {
        console.log('FILES.JS::FOUND', docs._id);
        if (err) throw err;
        callback(err, docs);
    });

};

exports.update = function (data, callback) {
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
            if (err) throw err;
            callback(err, {});
        });
};

exports.remove = function (data, callback) {
    'use strict';

    var id = db.ObjectId(data.id),
        assetFolder = null;

    //to make sure nothing else gets deleted
    db.files.find({_id : id}, {files : 1}, function onFound(err, docs) {

        //not waiting for the callback, if the file can't be deleted,
        //it should still get removed from database
        db.files.remove({_id : id}, function deleteCallback(err, docs) {
            console.log('FILES.JS::REMOVED', id);
            callback(err, docs);
        });

    });
};

exports.getFilesByAssetId = function (data, callback) {
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
};
