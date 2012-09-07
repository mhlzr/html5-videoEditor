//http://stackoverflow.com/questions/4093722/upload-a-file-in-a-google-chrome-extension
importScripts("poly/xhr2-FormData.js");

var fileQueue = [],
    fileReader = null,
    isUploading = false,
    xhr = new XMLHttpRequest(),
    formData = new FormData(),
    blob = null,
    currentFile = null;

var CHUNK_SIZE = 1048576; //1MB

self.onmessage = function (e) {


    if (!e.data.cmd) throw Error("Missing command-parameter.");
    switch (e.data.cmd) {
        case "add" :
            addFile(e.data.file, e.data.url, e.data.byteOffset, e.data.params);
            break;
        case "remove" :
            ;
            break;
        case "start" :
            start();
            break;
        default :
        case "stop" :
            break;

    }
};


function addFile(file, url, byteOffset, params) {

    byteOffset = byteOffset || 0;
    params = params || 0;

    if (!url) throw Error("Missing URL-parameter for file", file);
    //TODO params

    //check to see if file isn't already in queue
    if (fileQueue.length > 0) {
        for (var i = 0; i < fileQueue.length; i++) {
            if (fileQueue[i].name === file.name) {
                return;
            }
        }
    }

    file.url = url;
    file.params = params;
    file.byteOffset = byteOffset;

    fileQueue.push(file);
}

function removeFile(file) {
    if (currentFile === file) {
        xhr.abort();
        files.shift();
    }
}

function sendFileChunk(file, blob) {

    isUploading = true;

    formData.append("fileName", file.name);
    formData.append("byteOffset", file.byteOffset);
    formData.append("bytesTotal", file.size);
    formData.append("bytes", blob);

    for (var key in file.params) {
        formData.append(key, file.params[key]);
    }

    xhr.open("POST", file.url, true);
    xhr.send(formData);
}


function processFile(file) {

    var start = file.byteOffset,
        end = file.byteOffset + CHUNK_SIZE;

    fileReader = new FileReader();

    if (file.byteOffset + CHUNK_SIZE > file.size) {
        end = file.size;
    }

    blob = (file.mozSlice || file.slice).call(file, start, end);

    fileReader.onloadend = function (event) {
        if (event.target.readyState == FileReader.DONE) {
            //regex to get rid of the data;base stuff
            sendFileChunk(file, event.target.result.match(/,(.*)$/)[1]);
            fileReader = null;
        }
    };

    fileReader.readAsDataURL(blob);

}

function onXHRResponse(e) {

    formData = new FormData();
    blob = null;
    fileReader

    var res = JSON.parse(this.response),
        file = getFileByName(res.fileName),
        isComplete = false;

    file.byteOffset = res.byteOffset;

    if (res.status === "complete") {
        isComplete = true;
        fileQueue.shift();
    }

    postMessage({
        "fileName":file.name,
        "progressRelative":file.byteOffset / file.size * 100 | 0,
        "progressBytes":file.byteOffset,
        "complete":isComplete
    });

    if (fileQueue.length > 0 && isComplete) {
        processFile(fileQueue[0]);
    }
    else if (!isComplete) {
        processFile(file);
    }
    else {
        isUploading = false;
    }
}

function start() {

    xhr.onload = onXHRResponse;

    if (fileQueue.length > 0 && !isUploading) {
        processFile(fileQueue[0]);
    }
}

function stop() {
    if (isUploading) xhr.abort();
    if(fileReader) fileReader.abort();
    isUploading = false;
}


function getFileByName(fileName) {
    for (var i = 0; i < fileQueue.length; i++) {
        if (fileQueue[i].name === fileName) return fileQueue[i];
    }
}