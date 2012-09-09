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

    return this;

};

util.inherits(Encoder, events.EventEmitter);

exports.Encoder = Encoder;
