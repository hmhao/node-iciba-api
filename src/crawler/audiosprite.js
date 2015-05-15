var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    _ = require('underscore')._;

var defaults = {
    output: 'output',             //Name for the output files.
    path: '',                      //Path for files to be used on final JSON.
    export: 'ogg,m4a,mp3,ac3',  //Limit exported file types. Comma separated extension list.
    format: null,                 //Format of the output JSON file (jukebox, howler, createjs).
    autoplay: null,               //Autoplay sprite name.
    loop: [],                      //Loop sprite name, can be passed multiple times.
    silence: 0,                   //Add special "silence" track with specified duration.
    gap: 1,                        //Silence gap between sounds (in seconds).
    minlength: 0,                 //Minimum sound duration (in seconds).
    bitrate: 128,                 //Bit rate. Works for: ac3, mp3, mp4, m4a, ogg.
    vbr: -1,                       //VBR [0-9]. Works for: mp3. -1 disables VBR.
    samplerate: 44100,           //Sample rate.
    channels: 1,                  //Number of channels (1=mono, 2=stereo).
    rawparts: '',                //Include raw slices(for Web Audio API) in specified formats. Exported raw part files
    logger: {                     //Log level (debug, info, notice, warning, error).
        debug: function () {},
        info: function () {},
        log: function () {}
    },
    ceil: true,                   //每段音频是否向上增补Silence，使下段音频始终从整数开始
    ffmpegcmd: 'ffmpeg'         //指定的系统环境变量，可外部设置变化的实际路径
};

/** API Usage
 *  audiosprite(files, opts, function(err, obj) {})
 * */
module.exports = function (files) {
    var opts = {}, callback = function () {};

    if (arguments.length === 2) {
        callback = arguments[1];
    } else if (arguments.length >= 3) {
        opts = arguments[1];
        callback = arguments[2];
    }

    if (!files || !files.length) return callback(new Error('No input files specified.'));

    opts = _.extend({}, defaults, opts);

    // make sure output directory exists
    var outputDir = path.dirname(opts.output);
    if (!fs.existsSync(outputDir)) {
        require('mkdirp').sync(outputDir);
    }

    var offsetCursor = 0;
    var wavArgs = ['-ar', opts.samplerate, '-ac', opts.channels, '-f', 's16le'];
    var tempFile = mktemp('audiosprite');

    opts.logger.debug('Created temporary file', { file: tempFile });

    var json = {
        resources: [],
        spritemap: {}
    };

    spawn(opts.ffmpegcmd, ['-version']).on('exit', function (code) {
        if (code) {
            callback(new Error('ffmpeg was not found on your path'));
        }
        if (opts.silence) {
            json.spritemap.silence = {
                start: 0,
                end: opts.silence,
                loop: true
            };
            if (!opts.autoplay) {
                json.autoplay = 'silence';
            }
            appendSilence(opts.silence + opts.gap, tempFile, processFiles);
        } else {
            processFiles();
        }
    });
    /*创建临时文件*/
    function mktemp(prefix) {
        var tmpdir = require('os').tmpDir() || '.';
        return path.join(tmpdir, prefix + '.' + Math.random().toString().substr(2));
    }
    /*创建子进程*/
    function spawn(name, opt) {
        opts.logger.debug('Spawn', { cmd: [name].concat(opt).join(' ') });
        return require('child_process').spawn(name, opt);
    }

    function pad(num, size) {
        var str = num.toString();
        while (str.length < size) {
            str = '0' + str;
        }
        return str;
    }
    /*使用ffmpeg创建指定参数的原音频文件*/
    function makeRawAudioFile(src, cb) {
        var dest = mktemp('audiosprite');

        opts.logger.debug('Start processing', { file: src});

        fs.exists(src, function (exists) {
            if (exists) {
                var ffmpeg = spawn(opts.ffmpegcmd, ['-i', path.resolve(src)]
                    .concat(wavArgs).concat('pipe:'));
                ffmpeg.stdout.pipe(fs.createWriteStream(dest, {flags: 'w'}));
                ffmpeg.on('exit', function (code, signal) {
                    if (code) {
                        return cb({
                            msg: 'File could not be added',
                            file: src,
                            retcode: code,
                            signal: signal
                        });
                    }
                    cb(null, dest);
                });
            }
            else {
                cb({ msg: 'File does not exist', file: src });
            }
        });
    }
    /*附加音频文件*/
    function appendFile(name, src, dest, cb) {
        var size = 0;
        var reader = fs.createReadStream(src);
        var writer = fs.createWriteStream(dest, {
            flags: 'a'
        });
        reader.on('data', function (data) {
            size += data.length;
        });
        reader.on('close', function () {
            var originalDuration = size / opts.samplerate / opts.channels / 2;
            opts.logger.info('File added OK', { file: src, duration: originalDuration });
            var extraDuration = Math.max(0, opts.minlength - originalDuration);
            var duration = originalDuration + extraDuration;
            json.spritemap[name] = {
                start: offsetCursor,
                end: offsetCursor + duration,
                loop: name === opts.autoplay || opts.loop.indexOf(name) !== -1
            };
            offsetCursor += originalDuration;
            if(opts.ceil){
                appendSilence(extraDuration + Math.ceil(duration) - duration + opts.gap, dest, cb);
            }else{
                cb();
            }
        });
        reader.pipe(writer);
    }
    /*附加沉默音频*/
    function appendSilence(duration, dest, cb) {
        var buffer = new Buffer(Math.round(opts.samplerate * 2 * opts.channels * duration));
        buffer.fill(0);
        var writeStream = fs.createWriteStream(dest, { flags: 'a' });
        writeStream.end(buffer);
        writeStream.on('close', function () {
            opts.logger.info('Silence gap added', { duration: duration });
            offsetCursor += duration;
            cb();
        });
    }
    /*导出音频文件*/
    function exportFile(src, dest, ext, opt, store, cb) {
        var outfile = dest + '.' + ext;
        spawn(opts.ffmpegcmd, ['-y', '-ar', opts.samplerate, '-ac', opts.channels, '-f', 's16le', '-i', src]
            .concat(opt).concat(outfile))
            .on('exit', function (code, signal) {
                if (code) {
                    return cb({
                        msg: 'Error exporting file',
                        format: ext,
                        retcode: code,
                        signal: signal
                    });
                }
                if (ext === 'aiff') {
                    exportFileCaf(outfile, dest + '.caf', function (err) {
                        if (!err && store) {
                            json.resources.push(dest + '.caf');
                        }
                        fs.unlinkSync(outfile);
                        cb();
                    });
                } else {
                    opts.logger.info('Exported ' + ext + ' OK', { file: outfile });
                    if (store) {
                        json.resources.push(outfile);
                    }
                    cb();
                }
            });
    }

    function exportFileCaf(src, dest, cb) {
        if (process.platform !== 'darwin') {
            return cb(true);
        }
        spawn('afconvert', ['-f', 'caff', '-d', 'ima4', src, dest])
            .on('exit', function (code, signal) {
                if (code) {
                    return cb({
                        msg: 'Error exporting file',
                        format: 'caf',
                        retcode: code,
                        signal: signal
                    });
                }
                opts.logger.info('Exported caf OK', { file: dest });
                return cb();
            });
    }
    /*处理音频*/
    function processFiles() {
        var formats = {
            aiff: [],
            wav: [],
            ac3: ['-acodec', 'ac3', '-ab', opts.bitrate + 'k'],
            mp3: ['-ar', opts.samplerate, '-f', 'mp3'],
            mp4: ['-ab', opts.bitrate + 'k'],
            m4a: ['-ab', opts.bitrate + 'k'],
            ogg: ['-acodec', 'libvorbis', '-f', 'ogg', '-ab', opts.bitrate + 'k']
        };

        if (opts.vbr >= 0 && opts.vbr <= 9) {
            formats.mp3 = formats.mp3.concat(['-aq', opts.vbr]);
        }
        else {
            formats.mp3 = formats.mp3.concat(['-ab', opts.bitrate + 'k']);
        }

        if (opts.export.length) {
            formats = opts.export.split(',').reduce(function (memo, val) {
                if (formats[val]) {
                    memo[val] = formats[val];
                }
                return memo;
            }, {});
        }

        var rawparts = opts.rawparts.length ? opts.rawparts.split(',') : null;
        var i = 0;
        async.forEachSeries(files, function (file, cb) {
            i++;
            makeRawAudioFile(file, function (err, tmp) {
                if (err) {
                    return cb(err);
                }

                function tempProcessed() {
                    fs.unlinkSync(tmp);
                    cb();
                }

                var name = path.basename(file).replace(/\.[a-zA-Z0-9]+$/, '');
                appendFile(name, tmp, tempFile, function (err) {
                    if (rawparts != null ? rawparts.length : void 0) {
                        async.forEachSeries(rawparts, function (ext, cb) {
                            opts.logger.debug('Start export slice', { name: name, format: ext, i: i });
                            exportFile(tmp, opts.output + '_' + pad(i, 3), ext, formats[ext], false, cb);
                        }, tempProcessed);
                    } else {
                        tempProcessed();
                    }
                });
            });
        }, function (err) {
            if (err) {
                return callback(new Error('Error adding file'));
            }
            async.forEachSeries(Object.keys(formats), function (ext, cb) {
                opts.logger.debug('Start export', { format: ext });
                exportFile(tempFile, opts.output, ext, formats[ext], true, cb);
            }, function (err) {
                if (err) {
                    return callback(new Error('Error exporting file'));
                }
                if (opts.autoplay) {
                    json.autoplay = opts.autoplay;
                }

                json.resources = json.resources.map(function (e) {
                    return opts.path ? path.join(opts.path, path.basename(e)) : e;
                });

                var finalJson = {}, sn, spriteInfo;

                switch (opts.format) {
                    case 'howler':
                        finalJson.urls = [].concat(json.resources);
                        finalJson.sprite = {};
                        for (sn in json.spritemap) {
                            spriteInfo = json.spritemap[sn];
                            finalJson.sprite[sn] = [spriteInfo.start * 1000, (spriteInfo.end - spriteInfo.start) * 1000];
                            if (spriteInfo.loop) {
                                finalJson.sprite[sn].push(true);
                            }
                        }
                        break;
                    case 'createjs':
                        finalJson.src = json.resources[0];
                        finalJson.data = {audioSprite: []};
                        for (sn in json.spritemap) {
                            spriteInfo = json.spritemap[sn];
                            finalJson.data.audioSprite.push({
                                id: sn,
                                startTime: spriteInfo.start * 1000,
                                duration: (spriteInfo.end - spriteInfo.start) * 1000
                            });
                        }
                        break;
                    case 'default': // legacy support
                    default:
                        finalJson = json;
                        break;
                }

                fs.unlinkSync(tempFile);
                callback(null, finalJson);
            });
        });
    }
};
