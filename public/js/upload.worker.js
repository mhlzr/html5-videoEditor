//http://stackoverflow.com/questions/4093722/upload-a-file-in-a-google-chrome-extension
//importScripts("poly/xhr2-FormData.js");

var fileQueue = [],
    fileReader = new FileReader(),
    isUploading = false,
    xhr = new XMLHttpRequest(),
    formData = new FormData();
currentFile = null;

var CHUNK_SIZE = 1048576; //1MB

onmessage = function (e) {

    postMessage(e.data);

    if (!e.data.cmd) postMessage("Missing command!");

    switch (e.data.cmd) {
        case "add" :
            ;
            break;
        case "remove" :
            ;
            break;
        case "start" :
            break;
        default :
        case "stop" :
            break;

    }
};

function addFile(file, url, byteOffset, params) {
    byteOffset = byteOffset || 0;
}

function removeFile(file) {
    if (currentFile === file) {
        xhr.abort();
        files.shift();
    }
}

function start() {

}

function stop() {

}

