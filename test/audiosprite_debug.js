var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    request = require('request'),
    winston = require('winston'),
    audiosprite = require('../src/crawler/audiosprite');

var AUDIOSSRC = path.join(__dirname, '../data/mp3'),
    TMPDIR = path.join(AUDIOSSRC, './temp');

function cleanTmpDir() {
    if (!fs.existsSync(TMPDIR)) {
        require('mkdirp').sync(TMPDIR);
    }else{
        fs.readdirSync(TMPDIR).forEach(function (file) {
            if (/^audiosprite/.test(file)) {
                fs.unlinkSync(path.join(TMPDIR, file))
            }
        });
    }
}

cleanTmpDir();//清空TMPDIR
process.chdir(TMPDIR);//改变工作目录

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    colorize: true,
    level: 'info',
    handleExceptions: false
});

var opts = {
    'output': '',
    'export': 'mp3',
    'format': 'createjs',//jukebox, howler, createjs
    'gap': 0,
    'ceil': false,
    'logger': winston,
    'ffmpegcmd': path.join(__dirname, '../native_tools/ffmpeg/bin', 'ffmpeg.exe')
};

if(opts.ffmpegcmd){
    if (!fs.existsSync(opts.ffmpegcmd)) {
        winston.error('If use native tool, make sure it\'s available');
        process.exit(0);
    }
}

var words = ['JS','Angular','Bang'];
var files = [];
var iciba = new (require('../src/api/iciba'));

async.forEachSeries(words, function (word, next) {
    iciba.get(word, function (err, res) {
        if(err){
            next();
            return;
        }
        var spellURL = res.spells.length ? (res.spells.length == 2 ? res.spells[1].mp3 : res.spells[0].mp3) : '';
        if(spellURL){
            download(spellURL,word, next);
        }else{
            next();
        }
    });
}, downloadComplete);

function download(uri, filename, callback){
    console.log('save:', filename+'.mp3');
    var filepath = path.join(TMPDIR, filename+'.mp3');
    files.push(filepath);
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
    request(uri).pipe(fs.createWriteStream(filepath))
        .on('close', callback);  //调用request的管道来下载
}

function downloadComplete(err){
    if (err) throw err;
    if(files.length == words.length){
        opts.output = path.join(AUDIOSSRC, words.join('-') ||  'audiosprite-out-' + ~~(Math.random() * 1e6));
        audiosprite(files, opts, function(err, obj) {
            if (err) {
                winston.error(err);
                process.exit(0);
            }
            /*var jsonfile = opts.output + '.json';
            fs.writeFileSync(jsonfile, JSON.stringify(obj, null, 2));
            winston.info('Exported json OK', { file: jsonfile });*/
            winston.info(obj);

            async.forEachSeries(files, function(file, next){
                fs.unlinkSync(file);
                next()
            });
            winston.info('All done');
        });
    }else{
        winston.error('No full download');
        process.exit(0);
    }
}