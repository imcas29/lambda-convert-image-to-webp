// dependencies
var async = require('async');
var AWS = require('aws-sdk');
var sharp = require('sharp');
var util = require('util');

// constants
var STORAGE_CLASS = 'REDUCED_REDUNDANCY';

// get reference to S3 client 
var s3 = new AWS.S3();

var mimeTypes = {
    "jpg": "jpeg",
    "jpe": "jpeg",
    "jpeg": "jpeg",
    "png": "png",
    "gif": "gif"
};

exports.handler = function(event, context, callbackevent) {
    var srcBucket = event.Records[0].s3.bucket.name;
    var srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));  
    var dstBucket = srcBucket;
    var n = srcKey.indexOf('.');
    var dstKey = srcKey.substring(0, n != -1 ? n : key.length) + ".webp";
    var typeMatch = srcKey.match(/\.([^.]*)$/);
    if (!typeMatch) {
        callback("Could not determine the image type.");
        return;
    }
    var imageType = typeMatch[1];
    if (!/^(jpg|png|gif|webp)$/.test(imageType)) {
        context.succeed(); return;
    }
    var format = mimeTypes[imageType];
    if (!format) {
        context.succeed(); return;
    }
    /*

    */
    async.waterfall([
        function download(next) {
            s3.getObject({
                Bucket: srcBucket,
                Key: srcKey
            },
            next);
            console.log(srcBucket+ "  "+srcKey+ "After");
        },
        function transform(response, next) {
            console.log('transform');
            sharp(response.Body)
            .webp()
            .toBuffer(next);
        },
        function upload(data, info, next) {
            console.log('put object');
            s3.putObject({
                Bucket: dstBucket,
                Key: dstKey,
                Body: data,
            },
            next);
        }
    ], function (err) {
        console.log(err);
        if (err) {
            console.log(err);
            console.error(
                'Unable to convert ' + srcBucket + '/' + srcKey +
                ' and upload to ' + dstBucket + '/' + dstKey +
                ' due to an error: ' + err
            );
        } else {
            console.log(
                'Successfully converted ' + srcBucket + '/' + srcKey +
                ' and uploaded to ' + dstBucket + '/' + dstKey
            );
        }
        console.log(dstBucket + '/' + dstKey);
        callback(null, "message");
    });
};
