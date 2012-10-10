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
    res.redirect('/');
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

    socket.on('upload', function (data) {
        if (!data.projectId) return;
        projects.getProjectPathByProjectId(data.projectId, function (path) {
            upload.acceptData(data, data.projectId, path, function dataAccepted(res) {
                //TODO update DB
                if (res.isComplete) {
                    //void
                }
                socket.emit('upload:progress', res);
            });
        });
    });

    socket.on('transcode', function (data) {

        if (!data.projectId || !data.assetId || !data.formats || !data.fileName || !data.assetFolder) return;

        data.path = 'public/projects/' + data.assetFolder + '/assets/';

        delete data.assetFolder;

        data.formats.forEach(function (format) {
            encoder.addTranscodingJob(data, format, function onTranscodingProgress(progress) {
                //console.log(progress);
                //socket.emit
            });
        });

        encoder.start();

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

