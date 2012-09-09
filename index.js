var express = require('express'),
    app = express(),
    util = require('util'),
    fs = require('fs'),
    mongo = require("mongojs"),
    db = mongo.connect("/videoProjects", ["projects"]),
    projects = require('./projects'),
    encoder = require('./encoder').Encoder(db),
    events = require('events'),
    uploadXhr2 = require('./upload-xhr2');

app.use(express.bodyParser());

app.configure(function () {
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions : true, showStack : true }));

});

/*app.get('/preview/:id', function(req, res){
 res.redirect('/backbone/preview/#' + req.params.id);
 });
 */

//PROJECT CRUDS
app.post('/api/project/', projects.createProject);
app.get('/api/project/:id', projects.getProject);
app.put('/api/project/:id', projects.updateProject);
app.del('/api/project/:id', projects.deleteProject);

//XHR2-UPLOAD
app.post("/api/upload", function onUpload(req, res) {
    projects.getProjectPathByProjectId(req.body.projectId, function (path) {
        uploadXhr2.acceptData(req, res, req.body.projectId, path);
    });
});

//UPLOADER EVENTS
uploadXhr2.on("file:complete", function onFileUploadComplete(projectId, fileName) {
    projects.markAssetFileAsComplete(projectId, fileName);
});

/*
 db.projects.find({'compositions.name' : 'krasserSchnitt', 'name' : 'Lorem_254'}, function onFound(err, docs) {
 console.log('FOUND: ' + util.inspect(docs));
 });

 */

//DEBUGGING
app.get('/api/reset', function onReset(req, res) {
    projects.clean(function onComplete(err) {
        res.writeHead(200);
        res.end("Done!");
    });
});

app.listen(80);

encoder.start();