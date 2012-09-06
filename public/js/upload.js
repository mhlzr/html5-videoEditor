var fileReader = new FileReader(),
    files = [],
    isUploading = false,
    xhr = new XMLHttpRequest(),
    formData = new FormData();

var CHUNK_SIZE = 1048576 * 1; //1MB


function uploadInputChangeHandler(event) {

    _.each(event.target.files, function (file) {
        addFileToQueue(file);
    })

}


function start() {

    xhr.onload = onXHRResponse;

    if (files.length > 0 && !isUploading) {
        processFile(files[0]);
    }
}

function stop() {
    if (isUploading) xhr.abort();
    isUploading = false;
}

function processFile(file) {

    var start = file.bytePosition,
        end = file.bytePosition + CHUNK_SIZE,
        blob;

    if (file.bytePosition + CHUNK_SIZE > file.size) {
        end = file.size;
    }

    blob = (file.mozSlice || file.slice).call(file, start, end);

    fileReader.onloadend = function (event) {
        if (event.target.readyState == FileReader.DONE) {
            //regex to get rid of the data;base stuff
            sendFileChunk(file, event.target.result.match(/,(.*)$/)[1]);
        }
    }

    fileReader.readAsDataURL(blob);

}


function sendFileChunk(file, blob) {

    isUploading = true;

    formData.append("fileName", file.name);
    formData.append("bytePosition", file.bytePosition);
    formData.append("bytesTotal", file.size);
    formData.append("bytes", blob);

    xhr.open("POST", "/api/upload", true);
    xhr.send(formData);
}

function onXHRResponse(e) {

    console.log(this.response);

    formData = new FormData();

    var res = JSON.parse(this.response),
        file = getFileByName(res.fileName);

    file.bytePosition = res.bytePosition;

    if (res.status !== "complete") {
        processFile(file);
        //console.log(file.name, file.bytePosition/file.size*100 | 0, "%");
    }
    else {
        console.log(file.name, "is complete");
        files.shift();

        if (files.length > 0) {
            processFile(files[0]);
        }
        else {
            isUploading = false;
        }
    }
}


function addFileToQueue(file) {
    //check to see if file isn't already in queue
    for (var i = 0; i < files.length; i++) {
        if (files[i].name === file.name) {
            window.alert("A file with this name is already in the Library.");
            return;
        }
    }

    file.bytePosition = 0;
    files.push(file);
}


function getFileByName(fileName) {
    return _.find(files, function (file) {
        return file.name === fileName;
    });
}