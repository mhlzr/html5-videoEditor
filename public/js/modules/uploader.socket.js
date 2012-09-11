/**.
 * User: Matthieu Holzer
 * Date: 09.09.12
 * Time: 14:21
 */
define(["config", "jquery"], function (Config, $) {

    var uploader = function (socket) {

        var self = this,
            socket = socket,
            fileQueue = [],
            fileReader = null,
            isUploading = false,
            blob = null;

        this.addFile = function (file, projectId, byteOffset) {

            byteOffset = byteOffset || 0;

            //check to see if file isn't already in queue
            if (fileQueue.length > 0) {
                for (var i = 0; i < fileQueue.length; i++) {
                    if (fileQueue[i].name === file.name) {
                        return;
                    }
                }
            }

            file.projectId = projectId;
            file.byteOffset = byteOffset;

            fileQueue.push(file);
        };

        this.removeFile = function (file) {
            if (currentFile === file) {
                //this.abort();
                fileQueue.shift();
            }
        };

        this.sendFileChunk = function (file, blob) {

            isUploading = true;

            socket.emit("upload", {
                "fileName"   : file.name,
                "byteOffset" : file.byteOffset,
                "bytesTotal" : file.size,
                "bytes"      : blob,
                "projectId"  : file.projectId
            });

        };

        this.processFile = function (file) {

            var start = file.byteOffset,
                end = file.byteOffset + Config.UPLOADER_SOCKET_CHUNK_SIZE;

            fileReader = new FileReader();

            if (file.byteOffset + Config.UPLOADER_SOCKET_CHUNK_SIZE > file.size) {
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

            var file = self.getFileByName(res.fileName),
                isComplete = false;

            blob = null;
            fileReader = null;
            file.byteOffset = res.byteOffset;

            if (res.isComplete) {
                isComplete = true;
                fileQueue.shift();

                $(self).trigger("complete", {
                    "fileName" : file.name
                });

                if (fileQueue.length > 0) {
                    self.processFile(fileQueue[0]);
                }
                else {
                    isUploading = false;
                }
            }

            else if (!isComplete) {
                if (res.status === "success") {
                    $(self).trigger("progress", {
                        "fileName"         : file.name,
                        "progressRelative" : file.byteOffset / file.size * 100 | 0,
                        "progressBytes"    : file.byteOffset
                    });
                    self.processFile(file);
                }

            }

        };

        this.start = function () {

            console.log("UPLOADER.JS :: START");

            if (fileQueue.length > 0 && !isUploading) {
                //this.onload = uploader.onXHRResponse;
                this.processFile(fileQueue[0]);
            }
        };

        this.stop = function () {
            if (isUploading) uploader.abort();
            if (fileReader) fileReader.abort();
            isUploading = false;
        };

        this.getFileByName = function (fileName) {
            for (var i = 0; i < fileQueue.length; i++) {
                if (fileQueue[i].name === fileName) return fileQueue[i];
            }
        };

        socket.on("upload:progress", this.onResponse);
    };

    return uploader;
})
;