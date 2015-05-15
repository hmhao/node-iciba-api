var fs = require('fs'),
    path = require('path'),
    winston = require('winston'),
    audiosprite = require('../src/crawler/audiosprite');

var AUDIOSSRC = path.join(__dirname, '../data/mp3'),
    TMPDIR = path.join(AUDIOSSRC, './temp'),
    OUTPUT = 'audiosprite-out-' + ~~(Math.random() * 1e6);

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

var files = [path.join(AUDIOSSRC, 'Physics.mp3'), path.join(AUDIOSSRC, 'JS.mp3')];

if (!files.length) {
    winston.error('No input files specified.');
    process.exit(0);
}

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    colorize: true,
    level: 'info',
    handleExceptions: false
});

var opts = {
    'output': OUTPUT,
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

audiosprite(files, opts, function(err, obj) {
    if (err) {
        winston.error(err);
        process.exit(0);
    }
    var jsonfile = opts.output + '.json';
    fs.writeFileSync(jsonfile, JSON.stringify(obj, null, 2));
    winston.info('Exported json OK', { file: jsonfile });
    winston.info(obj);
    winston.info('All done');
});