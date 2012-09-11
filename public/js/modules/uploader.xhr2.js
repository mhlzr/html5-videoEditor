/**.
 * User: Matthieu Holzer
 * Date: 09.09.12
 * Time: 14:21
 */
define(["config", "jquery"], function (Config, $) {

    var uploader = new XMLHttpRequest();

    var fileQueue = [],
        fileReader = null,
        isUploading = false,
        formData = new FormData(),
        blob = null,
        currentFile = null;

    uploader.addFile = function (file, projectId, byteOffset) {

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

    uploader.removeFile = function (file) {
        if (currentFile === file) {
            uploader.abort();
            fileQueue.shift();
        }
    };

    uploader.sendFileChunk = function (file, blob) {

        isUploading = true;

        formData.append("fileName", file.name);
        formData.append("byteOffset", file.byteOffset);
        formData.append("bytesTotal", file.size);
        formData.append("bytes", blob);
        formData.append("projectId", file.projectId);

        uploader.open("POST", Config.UPLOADER_XHR_PATH, true);
        uploader.send(formData);
    };

    uploader.processFile = function (file) {

        var start = file.byteOffset,
            end = file.byteOffset + Config.UPLOADER_XHR_CHUNK_SIZE;

        fileReader = new FileReader();

        if (file.byteOffset + Config.UPLOADER_XHR_CHUNK_SIZE > file.size) {
            end = file.size;
        }

        blob = (file.webkitSlice || file.mozSlice || file.slice).call(file, start, end);

        fileReader.onloadend = function (event) {
            if (event.target.readyState == FileReader.DONE) {
                //regex to get rid of the data;base stuff
                uploader.sendFileChunk(file, event.target.result.match(/,(.*)$/)[1]);
                fileReader = null;
            }
        };

        fileReader.readAsDataURL(blob);

    };

    uploader.onXHRResponse = function (e) {

        formData = new FormData();
        blob = null;
        fileReader = null;

        var res = JSON.parse(this.response),
            file = uploader.getFileByName(res.fileName),
            isComplete = false;

        file.byteOffset = res.byteOffset;

        if (res.status === "complete") {
            isComplete = true;
            fileQueue.shift();

            $(this).trigger("complete", {
                "fileName" : file.name
            });

            if (fileQueue.length > 0) {
                uploader.processFile(fileQueue[0]);
            }
            else {
                isUploading = false;
            }
        }

        else if (!isComplete) {
            $(this).trigger("success", {
                "fileName"         : file.name,
                "progressRelative" : file.byteOffset / file.size * 100 | 0,
                "progressBytes"    : file.byteOffset
            });
            uploader.processFile(file);
        }

    };

    uploader.start = function () {

        console.log("UPLOADER START");

        if (fileQueue.length > 0 && !isUploading) {
            uploader.onload = uploader.onXHRResponse;
            uploader.processFile(fileQueue[0]);
        }
    };

    uploader.stop = function () {
        if (isUploading) uploader.abort();
        if (fileReader) fileReader.abort();
        isUploading = false;
    };

    uploader.getFileByName = function (fileName) {
        for (var i = 0; i < fileQueue.length; i++) {
            if (fileQueue[i].name === fileName) return fileQueue[i];
        }
    };

    return uploader;
})
;