var ffmpeg = require("fluent-ffmpeg"),
    util = require('util'),
    events = require('events');

var Encoder = function (db) {

    var self = this,
        db = db,
        jobs = [];

    events.EventEmitter.call(this);

    this.start = function () {
        console.log("ENCODER.JS :: STARTED");
        _getPendingEncodingJobsFromDatabase(function onJobsReceived(jobs) {

        })
    };

    var _getPendingEncodingJobsFromDatabase = function (callback) {
        //TODO
        callback([]);
    };

    this.addEncodingJob = function (job, hasPriority) {
        jobs.push(job);
    };

    this.transcode = function (path, fileName, ext) {

        //mp4 --> "mpeg4" oder "libx264"
        //ogg --> "ffmpeg2theora"

        var proc = new ffmpeg({
            source  : path + fileName + "." + ext,
            timeout : 240 * 60
        })
            .withVideoBitrate(1024)
            .toFormat('ogg')
            // .withVideoCodec('ffmpeg2theora')
            .saveToFile(path + fileName + "." + "ogg", function (retcode, error) {
                console.log(retcode, error, 'file has been converted succesfully');
            }
        );
    };

    return this;

};

util.inherits(Encoder, events.EventEmitter);

exports.Encoder = Encoder;
