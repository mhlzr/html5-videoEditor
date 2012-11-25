var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(3000),
    events = require('events'),
    fs = require('fs'),
    manager = require('./modules/manager').createManager(),
    encoder = require('./modules/encoder'),
    metadata = require('./modules/metadata');

app.use(express.bodyParser());

app.configure(function () {
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions : true, showStack : true }));

});

app.get(/^\/([0-9a-fA-F]{24}$)/, function (req, res) {
    manager.projects.isProjectExistent(req.params[0], function onResponse(exists) {
        if (exists) res.redirect('/#' + req.params[0]);
        else res.redirect('/');
    });
});

app.get('/reset', function onReset(req, res) {
    manager.clean(function onComplete(err) {
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
    //, 'flashsocket'
    , 'htmlfile'
    , 'xhr-polling'
    , 'jsonp-polling'
]);

io.sockets.on('connection', function (socket) {


    /*
     PROJECT CRUD
     */
    socket.on('project:create', manager.projects.create);
    socket.on('project:read', manager.projects.read);
    socket.on('project:update', manager.projects.update);
    socket.on('project:delete', manager.projects.remove);

    /*
     ASSET CRUD
     */
    socket.on('asset:create', manager.assets.create);
    socket.on('asset:read', manager.assets.read);
    socket.on('asset:update', manager.assets.update);
    socket.on('asset:delete', manager.assets.remove);

    /*
     File CRUD
     */
    socket.on('file:create', manager.files.create);
    socket.on('file:read', manager.files.read);
    socket.on('file:update', manager.files.update);
    socket.on('file:delete', function onRequest(data, callback) {
        "use strict";
        //the file gets unlinked first
        manager.removePhysicalFile(data, function onUnlinked() {
            //even if something fails, we still remove if from the db
            manager.files.remove(data, callback);
        });
    });

    /*
     COMPOSITION CRUD
     */
    socket.on('composition:create', manager.compositions.create);
    socket.on('composition:read', manager.compositions.read);
    socket.on('composition:update', manager.compositions.update);
    socket.on('composition:delete', manager.compositions.remove);

    /*
     SEQUENCE CRUD
     */
    socket.on('sequence:create', manager.sequences.create);
    socket.on('sequence:read', manager.sequences.read);
    socket.on('sequence:update', manager.sequences.update);
    socket.on('sequence:delete', manager.sequences.remove);

    /*
     COLLECTIONS FETCH
     */
    socket.on('library:read', manager.assets.getLibraryByProjectId);
    socket.on('compositions:read', manager.compositions.getCompositionsByProjectId);
    socket.on('files:read', manager.files.getFilesByAssetId);
    socket.on('sequences:read', manager.sequences.getSequencesByCompositionId);


    /*
     UPLOADER
     */

    socket.on('upload', function (data) {

        if (!data.projectId || !data.id) {
            throw new Error('Missing IDs');
        }

        //will be removed during update-process
        var fileId = data.id;

        manager.projects.getProjectPathByProjectId(data.projectId, function onPathFound(path) {
            if (!path) throw new Error('No assetFolder existent for Project');
            manager.acceptFilePartial(data, path, function onDataAccepted(res) {
                manager.files.update(res, function onUpdated(err) {
                    if (err) throw err;
                    res.id = fileId;

                    //inform about progress
                    socket.emit('file/' + res.id + ':update', res);

                    //read metaData if file is complete (more accurate than clients meta)
                    if (res.isComplete) {
                        var filePath = (__dirname + '/public/projects/' + path + '/assets/' + data.fileName);

                        manager.assets.getAssetByFileId(fileId, function onReceived(asset) {
                            metadata.getMetaData(asset.type, filePath, function onMetaDataRead(info) {
                                socket.emit('asset/' + asset.id + ':update', info);
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

        manager.projects.getProjectPathByProjectId(data.projectId, function onPathFound(projectPath) {
            if (!projectPath) throw new Error('No assetFolder existent for Project');
            data.path = manager.getAbsoluteFilePath(projectPath);
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


