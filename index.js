var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(3000),
    util = require('util'),
    fs = require('fs'),
    mongo = require("mongojs"),
    db = mongo.connect("/videoProjects", ["projects"]),
    projects = require('./projects'),
    encoder = require('./encoder'),
    events = require('events'),
    upload = require('./upload-socket');

app.use(express.bodyParser());

app.configure(function () {
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions : true, showStack : true }));

});

app.get(/^\/([0-9a-fA-F]{24}$)/, function (req, res) {
    projects.isProjectExistent(req.params[0], function onResponse(exists) {
        if (exists) res.redirect('/#' + req.params[0]);
        else res.redirect('/');
    });
});

app.get('/reset', function onReset(req, res) {
    projects.clean(function onComplete(err) {
        res.writeHead(200);
        res.end("Done!");
    });
});

/*app.get('/preview/:id', function(req, res){
 res.redirect('/backbone/preview/#' + req.params.id);
 });
 */

app.get('*', function (req, res) {
    res.writeHead(404);
    res.end();
    //res.redirect('/');
});

io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file
io.set('log level', 1);                    // reduce logging
io.set('transports', [                     // enable all transports (optional if you want flashsocket)
    'websocket'
    , 'flashsocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
]);

io.sockets.on('connection', function (socket) {

    /*
     PROJECT CRUD
     */
    socket.on('project:create', projects.createProject);
    socket.on('project:read', projects.readProject);
    socket.on('project:update', projects.updateProject);
    socket.on('project:delete', projects.deleteProject);

    /*
     ASSET CRUD
     */
    socket.on('asset:create', projects.createAsset);
    socket.on('asset:read', projects.readAsset);
    socket.on('asset:update', projects.updateAsset);
    socket.on('asset:delete', projects.deleteAsset);

    /*
     File CRUD
     */
    socket.on('file:create', projects.createFile);
    socket.on('file:read', projects.readFile);
    socket.on('file:update', projects.updateFile);
    socket.on('file:delete', projects.deleteFile);

    /*
     COMPOSITION CRUD
     */
    //TODO implement CRUD, create needs publicID

    /*
     COLLECTIONS FETCH
     */
    socket.on('library:read', projects.getLibraryByProjectId);
    socket.on('compositions:read', projects.getCompositionsByProjectId);
    socket.on('files:read', projects.getFilesByAssetId);


    /*
     UPLOADER
     */
    socket.on('upload', function (data) {

        if (!data.projectId || !data.id) {
            throw new Error('Missing IDs');
        }
        //will be removed during update-process
        var fileId = data.id;

        projects.getProjectPathByProjectId(data.projectId, function onPathFound(path) {
            upload.acceptData(data, path, function onDataAccepted(res) {
                projects.updateFile(res, function onUpdated(err) {

                    if (err) throw err;
                    res.id = fileId;

                    //inform about progress
                    socket.emit('file/' + res.id + ':update', res);

                    //read metaData if file is complete (more accurate than clients meta)
                    if (res.isComplete) {
                        var filePath = (__dirname + '/public/projects/' + path + '/assets/' + data.fileName);

                        projects.getAssetIdByFileId(fileId, function onReceived(assetId) {
                            console.log(assetId);
                            encoder.getMetaDataFromFile(filePath, function onMetaDataRead(metaData, err) {
                                if (err) throw err;
                                var res = {
                                    fps              : metaData.video.fps,
                                    duration         : metaData.durationsec,
                                    timecodeDuration : metaData.durationraw,
                                    width            : metaData.video.resolution.w,
                                    height           : metaData.video.resolution.h,
                                    ratio            : metaData.video.ratio,
                                    ratioString      : metaData.video.aspectString,
                                    isAnalyzed       : true
                                };
                                socket.emit('asset/' + assetId + ':update', res);
                            });
                        });

                    }

                });
            });
        });
    });

    /*
     TRANSCODER
     */
    socket.on('transcode', function (data) {

        if (!data.projectId || !data.formats || !data.id) {
            throw new Error('Missing IDs', data);
        }

        projects.getProjectPathByProjectId(data.projectId, function onPathFound(path) {
            data.path = 'public/projects/' + path + '/assets/';

            data.formats.forEach(function (format) {
                encoder.addTranscodingJob(data, format, function onTranscodingProgress(progress) {
                    console.log(progress);
                    socket.emit('file/' + res.id + ':update', res);
                });
            });
            encoder.start();
        });


    });

    encoder.on("transcoding:progress", function onTranscodingProgress(event) {
        socket.emit("transcoding:progress", event);
    });

    /*
     //ENCODER EVENTS
     encoder.on("encoding:complete", function onEncodingComplete() {

     });
     encoder.on("encoding:progress", function onEncodingProgress() {
     */
})
;


app.listen(80);

