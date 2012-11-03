var mongo = require('mongojs'),
    db = mongo.connect('/videoProjects', ['sequences']);

function create(data, callback) {
    'use strict';

    db.sequences.save(data, function saveCallback(err, docs) {
            console.log('SEQUENCES.JS::CREATED', docs._id);
            if (err) {
                throw err;
            }
            callback(err, docs);
        }
    );
}

function read(data, callback) {
    'use strict';

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

    var id = data._id;
    delete data._id;
    db.sequences.update({_id : db.ObjectId(id)}, data, {multi : false},
        function updateCallback(err, docs) {
            data._id = id;
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

    var id = db.ObjectId(data._id);

    db.sequences.remove({_id : id}, function onRemoved(err, docs) {
        console.log('SEQUENCES.JS::REMOVED', id);
        if (err) {
            throw err;
        }
        callback(err, docs);

    });

}


exports.create = create;
exports.read = read;
exports.update = update;
exports.remove = remove;
