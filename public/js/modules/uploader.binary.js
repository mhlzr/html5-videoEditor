/**
 * THERE IS A MEMORY-LEAK AND A LOT OF DEPRECATED METHODS IN
 * BINARY.JS, UNTIL ITS FIXED BETTER USE THE XHR-2 ALTERNATIVE
 * User: Matthieu Holzer
 * Date: 08.09.12
 * Time: 13:57
 */
define(["binary", "config", "jquery"], function (Binary, Config, $) {

        var uploader = new BinaryClient("ws://" + Config.UPLOADER_HOST + ":" + Config.UPLOADER_PORT, {chunkSize : Config.UPLOADER_CHUNK_SIZE}),
            fileQueue = [],
            isConnected = false,
            isUploading = false,
            isPaused = false,
            fileReader, stream, blob;

        uploader.on("open", function (stream, meta) {
            isConnected = true;
        });

        uploader.on("close", function () {
            isConnected = false;
            isUploading = false;
        });

        uploader.on("error", function (err) {
            throw err;
        });

        uploader.addFile = function (file, projectId, byteOffset) {

            if (!projectId) throw Error("Missing Project-ID");

            if (fileQueue.length > 0) {
                for (var i = 0; i < fileQueue.length; i++) {
                    if (fileQueue[i].name === file.name) {
                        return;
                    }
                }
            }

            file.projectId = projectId;
            file.byteOffset = byteOffset || 0;
            fileQueue.push(file);

        };

        uploader.removeFile = function (file) {
                           //TODO
        };

        uploader.processFile = function (file) {

            if (file.byteOffset === 0) {
                uploader.sendFileChunk(file);
            } else {
                fileReader = new FileReader();
                blob = (file.mozSlice || file.slice).call(file, file.byteOffset, file.size);

                fileReader.onloadend = function onLoadEnd(event) {

                    if (event.target.readyState == FileReader.DONE) {
                        var blobFile = event.target.result;
                        blobFile.name = file.name;
                        blobFile.projectId = file.projectId;
                        blobFile.byteOffset = file.byteOffset;
                        blobFile.size = file.size;

                        uploader.sendFileChunk(blobFile);
                        fileReader.removeEventListener("onloadend", onLoadEnd);
                        fileReader = null;

                    }
                };

                fileReader.readAsArrayBuffer(blob);
            }
        };

        uploader.sendFileChunk = function (file) {

            stream = uploader.send(file,
                {
                    "fileName"   : file.name,
                    "projectId"  : file.projectId,
                    "byteOffset" : file.byteOffset,
                    "size"       : file.size
                }
            );

            stream.on("error", function onError(err){
               console.log(err);
            });

            stream.on("data", function onData(data) {

                var file = uploader.getFileByName(data.fileName),
                    isComplete = false;

                if (data.status === "complete") {
                    stream.end();
                    stream.removeAllListeners();
                    stream.destroy();
                    stream = null;
                    isComplete = true;
                    fileQueue.shift();
                    console.log(file.name, "complete");
                    //$(file).trigger("complete")
                }

                if (isPaused) return;

                if (fileQueue.length > 0 && isComplete) {
                    console.log("NEXT FILE");
                    uploader.processFile(fileQueue[0]);
                }
                else if (!isComplete) {
                    //$(file).trigger("progress", {"progress" : data.byteOffset / file.size});
                    console.log(data.progress);
                }
                else {
                    isUploading = false;
                }

            });
        };

        uploader.start = function () {
            if (fileQueue.length > 0 && !isUploading && isConnected) {
                isPaused = false;
                uploader.processFile(fileQueue[0]);
            }
        };

        uploader.stop = function () {
            if (isConnected) {
                uploader.close();
                uploader.destroy();
                isUploading = isConnected = false;
                fileReader = null;
            }

        };

        uploader.pause = function () {
            isPaused = true;
        };

        uploader.getFileByName = function (fileName) {
            for (var i = 0; i < fileQueue.length; i++) {
                if (fileQueue[i].name === fileName) return fileQueue[i];
            }
        };

        /*$(uploader).bind("progress", function (e) {
            console.log(e.file, e.progress);
        });

        $(uploader).bind("complete", function (e) {
            console.log(e.file, "is complete");
        });     */

        return uploader;
    }
)
;