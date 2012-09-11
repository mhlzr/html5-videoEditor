var BufferedWriter = require('buffered-writer'),
    fs = require('fs'),
    util = require('util');

var UploadHandler = function () {

    this.acceptData = function (data, projectId, projectPath, callback) {

        var self = this,
            response;

        if (!data.fileName || !data.bytes || isNaN(data.byteOffset) || !data.bytesTotal) {
            console.log('Missing Parameters');
        }

        fs.open(__dirname + '/public/projects/' + projectPath + '/assets/' + data.fileName, 'a', function (err, fd) {

            if (err) throw err;

            var buffer = new Buffer(data.bytes, 'base64'),
                pos = parseInt(data.byteOffset),
                isComplete = false;

            fs.write(fd, buffer, 0, buffer.length, pos, function (err, written, buffer) {

                if (err) {
                    response = {
                        'isComplete' : false,
                        'fileName'   : data.fileName,
                        'byteOffset' : pos + buffer.length,
                        'status'     : 'fail'
                    };
                    callback(response);
                    return;

                }

                fs.close(fd, function (err) {

                    isComplete = pos + buffer.length === parseInt(data.bytesTotal);

                    response = {
                        'isComplete' : isComplete,
                        'fileName'   : data.fileName,
                        'byteOffset' : pos + buffer.length,
                        'status'     : isComplete ? 'complete' : 'success'
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

