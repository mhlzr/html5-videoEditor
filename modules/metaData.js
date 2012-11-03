/**
 * @author Matthieu Holzer
 */

var Metalib = require('fluent-ffmpeg').Metadata,
    imageMagick = require('node-imagemagick');

var MetaData = function () {
    'use strict';

    var self = this;

    this.getMetaData = function (type, filePath, callback) {
        if (type === 'video') {
            self.getMetaDataFromVideoFile(filePath, callback);
        } else if (type === 'audio') {
            self.getMetaDataFromAudioFile(filePath, callback);
        } else {
            self.getMetaDataFromImageFile(filePath, callback);
        }
    };

    this.getMetaDataFromVideoFile = function (filePath, callback) {

        var metaObject = new Metalib(filePath);
        metaObject.get(function onMetaDataRead(metaData, err) {
            if (err) {
                throw err;
            }
            var res = {
                fps              : metaData.video.fps,
                duration         : metaData.durationsec,
                timecodeDuration : metaData.durationraw,
                width            : metaData.video.resolution.w,
                height           : metaData.video.resolution.h,
                ratio            : metaData.video.ratio,
                ratioString      : metaData.video.aspectString,
                hasMetaData      : true,
                isAnalyzed       : true
            };

            callback(res);
        });

    };


    this.getMetaDataFromAudioFile = function (filePath, callback) {
        var metaObject = new Metalib(filePath);
        metaObject.get(callback);
    };

    this.getMetaDataFromImageFile = function (filePath, callback) {
        imageMagick.readMetadata(filePath, function (err, metaData) {
            if (err) {
                throw err;
            }
            callback(metaData);
        });
    };

    return this;
};

exports.getMetaData = new MetaData().getMetaData;

