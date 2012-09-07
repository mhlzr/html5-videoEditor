var express = require("express"),
    app = express(),
    util = require("util"),
    projects = require("./projects"),
    encoder = require("./encoder"),
    upload = require("./upload");

//app.use(express.limit(1048576 * 100));
app.use(express.bodyParser());

app.configure(function () {
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));

});


/*app.get("/preview/:id", function(req, res){
 res.redirect("/backbone/preview/#" + req.params.id);
 });
 */

//PROJECT CRUDS
app.post("/api/project/", projects.createProject);
app.get("/api/project/:id", projects.getProject);
app.put("/api/project/:id", projects.updateProject);
app.del("/api/project/:id", projects.deleteProject);

//UPLOAD
app.post("/api/upload", function(req, res){
    projects.getAssetPathByProjectId(req.body.id, function (path){
        upload.acceptData(req, res, path);
    });
});

/*

 db.projects.find( {"compositions.name" : "krasserSchnitt", "name" : "Lorem_254"}, function onFound(err,docs){
 console.log("FOUND: " + util.inspect(docs));
 });

 CLEANUP
 db.projects.remove({});



 */
app.listen(80);

encoder.encode();