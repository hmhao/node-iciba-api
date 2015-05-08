/// 依赖模块
var request = require("request"),
    path = require('path'),
    fs = require('fs'),
    cheerio = require("cheerio"),
    iciba = new (require('../api/iciba'));


var root = path.join(__dirname, '../../');
var dataDir = path.join(root, 'data');
fs.exists(dataDir, function (exists) {
    if (!exists) {
        fs.mkdir(dataDir);
    }
});

var config = {
    url: 'http://div.io/digg',
    rule: '',
    charset: 'utf8',
    headers: ''
};

var Crawler = function () {
    console.log('生成爬虫');
};

/** 获取页面
 * url:{String} 页面地址
 * callback:{Function} 获取页面完成后的回调callback(boolen,$)
 */
Crawler.prototype.request = function (url, callback) {
    var opts = {
        url: url,
        encoding: config.charset || 'utf8'
    };

    config.headers && (opts.headers = config.headers);

    console.log('发送' + url + '，等待响应中...');
    request(opts, function (err, res, body) {
        var $ = null;
        if (!err && res.statusCode === 200) {
            console.log('状态' + res.statusCode + '， ' + url + '请求成功');
            $ = cheerio.load(body);
        } else {
            !err && console.log('状态' + res.statusCode + '， ' + url + '请求失败');
        }
        callback(!!$, $);
    });
};

/** 开始处理的入口*/
Crawler.prototype.start = function () {
    var _this = this;
    _this.request(config.url, function (status, $) {
        if (status) {
            _this.analyse($);
        } else {
            console.log(config.url + '请求失败');
        }
    });
};

Crawler.prototype.analyse = function($){
    var userVocabulary = {},
        items = $('div.digg-list>ul>li'),
        len = items.length,
        i = 0,
        word, description;
    console.log('获取数量:'+len);
    var _getIciba = function(word,description){
        //console.log(word);
        var regexp = /^([\w\s\.-]+)/g;
        var match = regexp.exec(word);
        if(!match){
            len--;
            console.log('剔除:'+word);
            return;
        }
        word = match[1].trim();
        iciba.query(word, null, function (err, result) {
            if (err) {
                console.warn(err);
                return;
            }
            userVocabulary[result.word] = {
                word: word,
                related: word,
                description: description,
                mp3: (result.spells[1] && result.spells[1].mp3) || ''
            };
            if(++i>=len){
                console.log('写入数量:'+len);
                _writeFile(userVocabulary);
                console.log(config.url + '分析完成');
            }
        });
    };

    var _writeFile = function(vocabulary){
        var file = path.join(dataDir, 'vocabulary1.json');
        fs.writeFile(file, JSON.stringify(vocabulary), {encoding: 'utf-8', flag: 'w'}, function (err) {
            if (err) {
                throw err;
            }
        });
    };

    items.each(function(i, elem){
        word = $(elem).find('.info').text().trim();
        description = $(elem).find('.intro').text().trim();
        _getIciba(word, description);
    });
};

module.exports = Crawler;


