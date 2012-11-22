var mongo = require('mongojs'),
    db = mongo.connect('/videoProjects', ['sequences']);

function create(data, callback) {
    'use strict';

    db.sequences.save(data, function saveCallback(err, docs) {
            console.log('SEQUENCES.JS::CREATED', docs._id);
            if (err) {
                throw err;
            }
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

    db.sequences.findOne({_id : db.ObjectId(data._id)}, function onFound(err, docs) {
        console.log('SEQUENCES.JS::FOUND', docs._id);
        if (err) {
            throw err;
        }
        callback(err, docs);
    });

}

function update(data, callback) {
    'use strict';

    var id = data.id;
    delete data.id;
    delete data._id;

    db.sequences.update({_id : db.ObjectId(id)}, data, {multi : false},
        function updateCallback(err, docs) {
            data.id = id;
            console.log('SEQUENCES.JS::UPDATED', id);
            if (err) {
                throw err;
            }
            callback(err, {});
        }

    );

}

function remove(data, callback) {
    'use strict';

    var id = db.ObjectId(data.id);

    db.sequences.remove({_id : id}, function onRemoved(err, docs) {
        console.log('SEQUENCES.JS::REMOVED', id);
        if (err) {
            throw err;
        }
        callback(err, docs);

    });

}


function getSequencesByCompositionId(data, callback) {
    "use strict";
    'use strict';
    db.sequences.find({compositionId : data.id}, function onFound(err, docs) {
        console.log('PROJECTS.JS::SEQUENCES SERVED WITH', docs.length, 'SEQUENCES');
        if (err) throw err;

        //the whole _id/id thing created a mess in the file-Model
        for (var i = 0; i < docs.length; i++) {
            docs[i].id = docs[i]._id;
            delete docs[i]._id;
        }

        callback(err, docs);
    });
}


exports.create = create;
exports.read = read;
exports.update = update;
exports.remove = remove;

exports.getSequencesByCompositionId = getSequencesByCompositionId;
