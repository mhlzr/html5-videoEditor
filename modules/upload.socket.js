var BufferedWriter = require('buffered-writer'),
    fs = require('fs'),
    util = require('util');

var UploadHandler = function () {
    'use strict';

    this.acceptData = function (data, projectDir, callback) {

        var response;

        if (!data.fileName || !data.bytes || isNaN(data.byteOffset) || !data.bytesTotal) {
            throw new Error('Missing or false parameters');
        }

        fs.open(__dirname + '/../public/projects/' + projectDir + '/assets/' + data.fileName, 'a', function (err, fd) {

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
                        console.log("UPLOAD.JS :: FILE COMPLETE", data.fileName);
                    }

                    callback(response);

                });

            });

        });

    };

    return this;
};

module.exports = new UploadHandler();

