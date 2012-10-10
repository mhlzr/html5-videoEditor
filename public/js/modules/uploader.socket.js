/**.
 * User: Matthieu Holzer
 * Date: 09.09.12
 * Time: 14:21
 */
define(['config', 'jquery', 'underscore'], function (Config, $, _) {

    var uploader = function (socket) {

        var self = this,
            socket = socket,
            fileQueue = [],
            fileReader = null,
            isUploading = false,
            blob = null;

        this.addFile = function (projectId, assetId, fileId, file, byteOffset) {

            byteOffset = byteOffset || 0;

            //check to see if file isn't already in queue
            if (fileQueue.length > 0) {
                for (var i = 0; i < fileQueue.length; i++) {
                    if (fileQueue[i].id === fileId) {
                        return;
                    }
                }
            }

            file.projectId = projectId;
            file.assetId = assetId;
            file.id = fileId;
            file.byteOffset = byteOffset;

            console.log(file);

            fileQueue.push(file);
        };

        this.removeFile = function (id) {

            //if currentFile
            if (fileQueue[0].id === id && isUploading) {
                //TODO what now?
            }

            fileQueue = _.reject(fileQueue, function (file) {
                return  file.id === id;
            });

        };

        this.sendFileChunk = function (file, blob) {

            isUploading = true;

            socket.emit('upload', {
                'projectId'  : file.projectId,
                'id'         : file.id,
                'fileName'   : file.name,
                'byteOffset' : file.byteOffset,
                'bytesTotal' : file.size,
                'bytes'      : blob
            });

        };

        this.processFile = function (file) {

            var start = file.byteOffset,
                end = file.byteOffset + Config.UPLOADER_CHUNK_SIZE;

            //change asset-status
            app.project.get('library').get(file.assetId).set('status', 'Uploading');

            fileReader = new FileReader();

            if (file.byteOffset + Config.UPLOADER_CHUNK_SIZE > file.size) {
                end = file.size;
            }

            blob = (file.slice || file.webkitSlice || file.mozSlice).call(file, start, end);

            fileReader.onloadend = function (event) {
                if (event.target.readyState == FileReader.DONE) {

                    //regex to get rid of the data;base stuff
                    self.sendFileChunk(file, event.target.result.match(/,(.*)$/)[1]);
                    fileReader = null;
                }
            };

            fileReader.readAsDataURL(blob);

        };

        this.onResponse = function (res) {

            var file = self.getFileById(res.id),
                isComplete = false;

            //this would happen if the file got removed
            if (!file) {
                self.start();
                return;
            }

            blob = null;
            fileReader = null;
            file.byteOffset = res.byteOffset;

            if (res.isComplete) {
                fileQueue.shift();

                $(self).trigger('complete', {
                    'fileName' : file.name,
                    'id'       : file.id,
                    'assetId'  : file.assetId
                });

                if (fileQueue.length > 0) {
                    self.processFile(fileQueue[0]);
                }
                else {
                    isUploading = false;
                }
            }

            else if (!isComplete) {
                if (res.status === 'success') {
                    $(self).trigger('progress', {
                        'fileName'         : file.name,
                        'id'               : file.id,
                        'assetId'          : file.assetId,
                        'progressRelative' : Math.round(file.byteOffset / file.size * 100 * Math.pow(10, 2)) / Math.pow(10, 2),
                        'progressBytes'    : file.byteOffset
                    });
                    self.processFile(file);
                }

            }

        };

        this.start = function () {

            if (fileQueue.length > 0 && !isUploading) {
                console.log('UPLOADER.JS :: START');
                this.processFile(fileQueue[0]);
            }
        };

        this.stop = function () {
            if (!isUploading)  return;
            if (fileReader) fileReader.abort();
            isUploading = false;
        };

        this.getFileById = function (id) {
            return _.find(fileQueue, function (file) {
                return file.id === id;
            }) || null;
        };

        socket.on('upload:progress', this.onResponse);
    };

    return uploader;

})
;