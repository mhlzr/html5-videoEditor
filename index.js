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
app.post("/api/upload", upload.acceptData);

/*

 db.projects.find( {"compositions.name" : "krasserSchnitt", "name" : "Lorem_254"}, function onFound(err,docs){
 console.log("FOUND: " + util.inspect(docs));
 });

 CLEANUP
 db.projects.remove({});



 app.post('/upload', function(req, res){

 var data = req.body,
 response;

 //console.log(util.inspect(data));

 fs.open(__dirname+"public/projects/" + data.fileName, "a", function(err, fd){

 if(err) {throw err};


 //console.log(data.bytes);

 var buffer = new Buffer(data.bytes, "base64"),
 pos = parseInt(data.bytePosition);

 console.log("\n", pos, "\n");

 //fs.write(fd, buffer, offset, length, position, [callback])
 fs.write(fd, buffer, 0, buffer.length, null, function(err, written, buffer) {

 if(err) {throw err};

 console.log("WRITING COMPLETE");

 fs.close(fd, function(err){
 console.log("FILE CLOSED");

 response = {
 "fileName" : data.fileName,
 "bytePosition" : pos+buffer.length
 ,					"status" : (pos + buffer.length === parseInt(data.bytesTotal)) ? "complete" : "success"
 };



 res.writeHead(200, {"content-type": "application/json"});
 res.end( JSON.stringify( response) );
 });





 });

 });





 });

 */
app.listen(80);

encoder.encode();