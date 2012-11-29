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

        var job;

        if (this.jobs.length > 0 && this.threads < this.MAX_THREADS) {

            console.log("ENCODER :: STARTED");

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

    this.addTranscodingJob = function (settings) {
        settings.type = 'transcode';
        this.jobs.push(settings);
    };

    this.encode = function (job) {

    };

    this.transcode = function (job) {

        var self = this;
        //mp4 --> "mpeg4" or "libx264"
        //ogg --> "ffmpeg2theora"


        var proc = new ffmpeg({
            source  : job.path + job.originalFileName,
            timeout : 240 * 60
        })
            .withVideoBitrate(500)
            .toFormat(job.format)
            .onProgress(function (progress) {

                self.emit('transcoding:progress', {
                    fileId           : job.fileId,
                    projectId        : job.projectId,
                    encodingProgress : Math.round(progress.percent * Math.pow(10, 2)) / Math.pow(10, 2),
                    isComplete       : false
                });
            })
            //if complete
            .saveToFile(job.path + job.fileName, function (stdout, stderr, err) {

                self.emit('transcoding:progress', {
                    fileId           : job.fileId,
                    projectId        : job.projectId,
                    encodingProgress : 100,
                    isComplete       : true
                });

                //just to make sure that nothing gets done twice
                self.jobs = _.reject(self.jobs, function (oldJob) {
                    return oldJob.fileId === job.fileId && oldJob.format === job.format;
                });

                self.threads--;
                self.start();
            }
        );
    };

    return this;

};

util.inherits(Encoder, events.EventEmitter);

module.exports = new Encoder();
