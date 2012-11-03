var mongo = require('mongojs'),
    db = mongo.connect('/videoProjects', ['assets']);

function create(data, callback) {
    db.assets.save(data, function saveCallback(err, docs) {
            console.log('ASSET.JS::CREATED', docs._id);
            if (err) throw err;
            callback(err, docs);
        }
    );
}

function read(data, callback) {
    db.assets.findOne({_id : db.ObjectId(data._id)}, function onFound(err, docs) {
        console.log('ASSET.JS::FOUND', docs._id);
        if (err) throw err;
        callback(err, docs);
    });

}

function update(data, callback) {
    var id = data._id;
    delete data._id;
    db.assets.update({_id : db.ObjectId(id)}, data, {multi : false},
        function updateCallback(err, docs) {
            data._id = id;
            console.log('ASSET.JS::UPDATED', id);
            if (err) throw err;
            callback(err, {});
        }

    )
    ;

}

function remove(data, callback) {

    var id = db.ObjectId(data._id),
        assetFolder = null;

    //to make sure nothing else gets deleted
    db.assets.find({_id : id}, {files : 1}, function onFound(err, docs) {
        //TODO delete all files and remove from db
        //assetFolder = docs.assetFolder;
        db.assets.remove({_id : id}, function deleteCallback(err, docs) {
            console.log('ASSET.JS::REMOVED', id);
            if (err) throw err;
            callback(err, docs);

        });

    });
}

function getLibraryByProjectId(data, callback) {
    db.assets.find({projectId : data.id}, function onFound(err, docs) {
        console.log('PROJECTS.JS::LIBRARY SERVED WITH', docs.length, 'ASSETS');
        if (err) throw err;
        callback(err, docs);
    });
}

function getAssetByFileId(fileId, callback) {
    'use strict';
    db.assets.findOne({files : {$all : [fileId]}}, function onFound(err, docs) {
            if (err) throw err;
            callback(docs);
        }
    );
}


exports.create = create;
exports.read = read;
exports.update = update;
exports.remove = remove;

exports.getLibraryByProjectId = getLibraryByProjectId;
exports.getAssetByFileId = getAssetByFileId;
