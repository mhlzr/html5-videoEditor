var ffmpeg = require("fluent-ffmpeg"),
    jobs = getPendingEncodingJobs();

function getPendingEncodingJobs() {
    //TODO
    return [];
}
;

function addEncodingJob(job) {
    jobs.push(job);
}

function encode() {
    console.log("Starting Encoder");
}


exports.encode = encode;
exports.addEncodingJob = addEncodingJob;