var BufferedWriter = require('buffered-writer'),
    fs = require('fs'),
    util = require('util'),
    events = require('events');

var UploadHandler = function () {

    //like super
    events.EventEmitter.call(this);

    this.acceptData = function (req, res, projectId, projectPath) {

        var self = this,
            data = req.body,
            response;

        if (!data.fileName || !data.bytes || !data.byteOffset || !data.bytesTotal) {
            return;
        }

        fs.open(__dirname + '/public/projects/' + projectPath + '/assets/' + data.fileName, 'a', function (err, fd) {

            if (err) {
                throw err;
            }

            var buffer = new Buffer(data.bytes, 'base64'),
                pos = parseInt(data.byteOffset),
                isComplete = false;

            fs.write(fd, buffer, 0, buffer.length, pos, function (err, written, buffer) {

                if (err) {
                    response = {
                        'fileName'   : data.fileName,
                        'byteOffset' : pos + buffer.length,
                        'status'     : 'fail'
                    };

                }

                fs.close(fd, function (err) {

                    isComplete = pos + buffer.length === parseInt(data.bytesTotal);

                    response = {
                        'fileName'   : data.fileName,
                        'byteOffset' : pos + buffer.length,
                        'status'     : isComplete ? 'complete' : 'success'
                    };

                    res.writeHead(200, {'content-type' : 'application/json'});
                    res.end(JSON.stringify(response));

                    if (isComplete) {
                        console.log("UPLOAD.JS :: FILE COMPLETE", data.fileName);
                        self.emit('file:complete', projectId, data.fileName);
                    }
                });

            });

        });

    }

    return this;
};

util.inherits(UploadHandler, events.EventEmitter);

module.exports = new UploadHandler();

