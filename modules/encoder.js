var ffmpeg = require('fluent-ffmpeg'),
    util = require('util'),
    events = require('events'),
    _ = require('underscore');

var Encoder = function () {

    this.threads = 0;
    this.jobs = [];

    this.MAX_THREADS = 2;

    events.EventEmitter.call(this);

    this.start = function () {
        console.log("ENCODER.JS :: STARTED");

        var job;

        if (this.jobs.length > 0 && this.threads < this.MAX_THREADS) {

            job = this.jobs.shift();

            if (job.type === 'transcode')
                this.transcode(job);
            else
                this.encode(job);

            this.threads++;
            this.start();
        }
    };

    this.addEncodingJob = function (job, hasPriority) {
        // jobs.push(job);
    };

    this.addTranscodingJob = function (settings, format, callback) {

        console.log('ENCODER.JS :: TRANSCODING JOB ADDED');
        console.log(settings, format);
//TODO remove return
        return;
        var job = {};
        job.assetId = settings.assetId;
        job.path = settings.path;
        job.fileName = settings.fileName;
        job.projectId = settings.projectId;
        job.format = format;
        job.callback = callback;
        job.type = 'transcode';

        this.jobs.push(job);

    };

    this.encode = function (job) {

    };

    this.transcode = function (job) {

        var self = this;
        //mp4 --> "mpeg4" oder "libx264"
        //ogg --> "ffmpeg2theora"

        var proc = new ffmpeg({
            source  : job.path + job.fileName,
            timeout : 240 * 60
        })
            .withVideoBitrate(500)
            .toFormat(job.format)
            .onProgress(function (progress) {

                self.emit('transcoding:progress', {
                    'assetId'    : job.assetId,
                    'projectId'  : job.projectId,
                    'format'     : job.format,
                    'progress'   : Math.round(progress.percent * Math.pow(10, 2)) / Math.pow(10, 2),
                    'isComplete' : false
                });
            })
            .saveToFile(job.path + job.fileName + "." + job.format, function (retcode, error) {

                //TODO real size & url
                self.emit('transcoding:progress', {
                    'assetId'    : job.assetId,
                    'projectId'  : job.projectId,
                    'format'     : job.format,
                    'progress'   : 100,
                    'size'       : 0,
                    'url'        : job.fileName + "." + job.format,
                    'isComplete' : true
                });

                //TODO save it to db, if there is no client available anymore

                //just to make sure
                self.jobs = _.without(self.jobs, job);
                self.threads--;
                self.start();
            }
        );
    };

    return this;

};

util.inherits(Encoder, events.EventEmitter);

module.exports = new Encoder();
