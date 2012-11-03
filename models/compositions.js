var uuid = require('node-uuid'),
    mongo = require('mongojs'),
    db = mongo.connect('/videoProjects', ['compositions']);


function create(data, callback) {
    'use strict';

    data.publicId = uuid.v4().replace(/-/g, '');

    db.compositions.save(data, function onSaved(err, docs) {
        console.log('COMPOSITIONS.JS:::CREATED', docs._id);
        if (err) throw err;
        callback(err, docs);
    });
}


function read(data, callback) {
    'use strict';
    db.compositions.findOne({_id : db.ObjectId(data._id)}, function onFound(err, docs) {
        console.log('COMPOSITIONS.JS:: FOUND', docs._id);
        if (err) throw err;
        callback(err, docs);
    });

}


function update(data, callback) {
    'use strict';

    var id = data._id;
    delete data._id;
    delete data.publicId;

    db.compositions.update({_id : db.ObjectId(id)}, data, {multi : false},
        function onUpdated(err, docs) {
            data._id = id;
            console.log('COMPOSITIONS.JS::UPDATED', id);
            if (err) throw err;
            callback(err, {});
        }
    );
}


function remove(data, callback) {
    'use strict';

    var id = db.ObjectId(data._id);

    db.compositions.remove({_id : db.ObjectId(id)},
        function onRemoved(err, docs) {
            console.log('COMPOSITIONS.JS::DELETED', id);
            if (err) throw err;
            callback(err, docs);
        }
    );
}

function getCompositionsByProjectId(data, callback) {
    db.compositions.find({projectId : data.id}, function onFound(err, docs) {
        console.log('PROJECTS.JS::COMPOSITIONS SERVED WITH', docs.length, 'COMPS.');
        if (err) throw err;
        callback(err, docs);
    });
}

exports.create = create;
exports.read = read;
exports.update = update;
exports.remove = remove;

exports.getCompositionsByProjectId = getCompositionsByProjectId;