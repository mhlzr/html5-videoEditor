var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(3000),
    util = require('util'),
    events = require('events'),
    fs = require('fs'),
    projects = require('./models/projects'),
    assets = require('./models/assets'),
    files = require('./models/files'),
    compositions = require('./models/compositions'),
    sequences = require('./models/sequences'),
    encoder = require('./modules/encoder'),
    metadata = require('./modules/metadata'),
    upload = require('./modules/upload.socket');

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
    socket.on('project:create', projects.create);
    socket.on('project:read', projects.read);
    socket.on('project:update', projects.update);
    socket.on('project:delete', projects.remove);

    /*
     ASSET CRUD
     */
    socket.on('asset:create', assets.create);
    socket.on('asset:read', assets.read);
    socket.on('asset:update', assets.update);
    socket.on('asset:delete', assets.remove);

    /*
     File CRUD
     */
    socket.on('file:create', files.create);
    socket.on('file:read', files.read);
    socket.on('file:update', files.update);
    socket.on('file:delete', files.remove);

    /*
     COMPOSITION CRUD
     */
    socket.on('composition:create', compositions.create);
    socket.on('composition:read', compositions.read);
    socket.on('composition:update', compositions.update);
    socket.on('composition:delete', compositions.remove);

    /*
     SEQUENCE CRUD
     */
    socket.on('sequence:create', sequences.create);
    socket.on('sequence:read', sequences.read);
    socket.on('sequence:update', sequences.update);
    socket.on('sequence:delete', sequences.remove);

    /*
     COLLECTIONS FETCH
     */
    socket.on('library:read', assets.getLibraryByProjectId);
    socket.on('compositions:read', compositions.getCompositionsByProjectId);
    socket.on('files:read', files.getFilesByAssetId);


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
                files.update(res, function onUpdated(err) {

                    if (err) throw err;
                    res.id = fileId;

                    //inform about progress
                    socket.emit('file/' + res.id + ':update', res);

                    //read metaData if file is complete (more accurate than clients meta)
                    if (res.isComplete) {
                        var filePath = (__dirname + '/public/projects/' + path + '/assets/' + data.fileName);

                        assets.getAssetByFileId(fileId, function onReceived(asset) {
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


