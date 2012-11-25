var uuid = require('node-uuid'),
    mongo = require('mongojs'),
    db = mongo.connect('/videoProjects', ['compositions']),
    files = null,
    sequences = null;

exports.init = function (files, sequences) {
    "use strict";
    this.files = files;
    this.sequences = sequences;
    return this;
};


exports.create = function (data, callback) {
    'use strict';

    data.publicId = uuid.v4().replace(/-/g, '');

    db.compositions.save(data, function onSaved(err, docs) {
        console.log('COMPOSITIONS.JS:::CREATED', docs._id);
        if (err) throw err;
        callback(err, docs);
    });
};


exports.read = function (data, callback) {
    'use strict';
    db.compositions.findOne({_id : db.ObjectId(data._id)}, function onFound(err, docs) {
        console.log('COMPOSITIONS.JS:: FOUND', docs._id);
        if (err) throw err;
        callback(err, docs);
    });

};


exports.update = function (data, callback) {
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
};


exports.remove = function (data, callback) {
    'use strict';

    var id = db.ObjectId(data._id);

    db.compositions.remove({_id : id},
        function onRemoved(err, docs) {
            console.log('COMPOSITIONS.JS::DELETED', id);
            if (err) throw err;
            callback(err, docs);
        }
    );
};


exports.getCompositionsByProjectId = function (data, callback) {
    db.compositions.find({projectId : data.id}, function onFound(err, docs) {
        console.log('PROJECTS.JS::COMPOSITIONS SERVED WITH', docs.length, 'COMPS.');
        if (err) throw err;
        callback(err, docs);
    });
};
