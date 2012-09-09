//BINARY-WEBSOCKET FOR UPLOADS
/*

 BinaryServer = require('binaryjs').BinaryServer,
 server = BinaryServer({port : 9000}),

server.on('connection', function (client) {

    client.on('stream', function (stream, meta) {

        projects.getAssetPathByProjectId(meta.projectId, function (path) {

            var file = fs.createWriteStream(__dirname + '/public/projects/' + path + '/assets/' + meta.fileName, {
                flags : 'a',
                mode  : 0666,
                start : meta.byteOffset
            });

            stream.pipe(file);

            stream.on('data', function onData(data) {

                console.log(stream.id, meta.fileName, data.length, file.bytesWritten);

                var data = {
                    'fileName' : meta.fileName,
                    'progress' : file.bytesWritten / meta.size * 100,
                    'status'   : 'success'
                };

                stream.write(data);

            });

            stream.on('error', function onError(err) {
                console.log(err);
            });

            stream.on('end', function onEnd() {
                var data = {
                    'fileName' : meta.fileName,
                    'status'   : 'complete'
                };
                stream.write(data);
                //stream.destroy();
            });
        });
    });
});
    */