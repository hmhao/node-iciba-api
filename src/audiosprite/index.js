'use strict';

var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    request = require('request'),
    winston = require('winston'),
    audiosprite = require('./audiosprite'),
    iciba = new (require('../api/iciba'))();

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    colorize: true,
    level: 'info',
    handleExceptions: false
});

var ROOT = path.join(__dirname, '../../'),
    AUDIOSSRC = path.join(ROOT, '/data/mp3'),
    COMMONDIR = path.join(AUDIOSSRC, '/common'),
    TMPDIR = path.join(AUDIOSSRC, '/temp'),
    opts = {
        'output': '',
        'export': 'mp3',
        'format': 'createjs',//jukebox, howler, createjs
        'gap': 0,
        'ceil': false,
        'logger': winston,
        'ffmpegcmd': path.join(ROOT, '/native_tools/ffmpeg/bin', 'ffmpeg.exe')
    },
    audioWords = [],
    audioFiles = [];

if(opts.ffmpegcmd){
    if (!fs.existsSync(opts.ffmpegcmd)) {
        winston.error('If use native tool, make sure it\'s available');
        process.exit(0);
    }
}

function cleanTmpDir() {
    if (!fs.existsSync(TMPDIR)) {
        require('mkdirp').sync(TMPDIR);
    }else{
        fs.readdirSync(TMPDIR).forEach(function (file) {
            if (/^audiosprite/.test(file)) {
                fs.unlinkSync(path.join(TMPDIR, file));
            }
        });
    }
}
/**获取音标
 * words: {String}
 * callback:{Function}  eg.function(err, res)   res为音标路径
 * */
function getWordSpell(word, callback){
    var wordPath = path.join(COMMONDIR, word.toUpperCase() + '.mp3');
    if(fs.existsSync(wordPath)){
        callback(null, wordPath);
    }else{
        iciba.get(word, function (err, res) {
            if(err){
                winston.error(err);
                callback(err);
                return;
            }
            var spellURL = res.spells.length ? res.spells[0].mp3 : '';
            callback(null, spellURL);
        });
    }
}

function download(uri, filename, callback){
    var filepath = path.join(TMPDIR, 'audiosprite-d-' + ~~(Math.random() * 1e6)+'.mp3');
    audioFiles.push(filepath);
    /*request.head(uri, function(err, res, body){
     console.log('content-type:', res.headers['content-type']);  //返回的数据类型
     console.log('content-length:', res.headers['content-length']);  //数据大小
     if (err) {
     console.log('err: '+ err);
     return false;
     }
     request(uri).pipe(fs.createWriteStream(filepath))
     .on('close', callback);  //调用request的管道来下载
     });*/
    var isUrl = /^https?:/i;
    if(isUrl.test(uri)){
        console.log('save:', filename+'.mp3');
        request(uri).pipe(fs.createWriteStream(filepath))
            .on('close', callback);  //调用request的管道来下载
    }else{
        console.log('copy:',filename+'.mp3');
        fs.createReadStream(uri).pipe(fs.createWriteStream(filepath))
            .on('close', callback);
    }
}

function combineSprite(callback){
    if(audioFiles.length === audioWords.length){
        opts.output = path.join(AUDIOSSRC, audioWords.join('-') ||  'audiosprite-c-' + ~~(Math.random() * 1e6));
        audiosprite(audioFiles, opts, function(err, obj) {
            if (err) {
                callback(err);
                return;
            }
            /*var jsonfile = opts.output + '.json';
             fs.writeFileSync(jsonfile, JSON.stringify(obj, null, 2));
             winston.info('Exported json OK', { file: jsonfile });*/
            winston.info(obj);

            async.forEachSeries(audioFiles, function(file, next){
                fs.unlinkSync(file);
                next();
            });
            winston.info('All done');
            callback(null, obj.src);
        });
    }else{
        callback(new Error(audioWords.join('') + ' not full download'));
    }
}

/** API Usage
 *  audiosprite(words, function(err, obj) {})
 * */
module.exports = function(words, callback){
    audioWords = words || [];
    audioFiles = [];
    cleanTmpDir();//清空TMPDIR
    process.chdir(TMPDIR);//改变工作目录
    if(audioWords.length){
        if(audioWords.length === 1){
            getWordSpell(audioWords[0], callback);
        }else{
            async.forEachSeries(audioWords, function (word, next) {
                getWordSpell(word, function(err, url){
                    if(err){
                        winston.error(err);
                        next();
                        return;
                    }
                    if(url){
                        download(url, word, next);
                    }else{
                        next();
                    }
                });
            }, function(err){
                callback = callback || function(){};
                if(err) {
                    callback(err);
                    return;
                }
                combineSprite(callback);
            });
        }
    }else{
        callback(new Error('pass no word'));
    }
};