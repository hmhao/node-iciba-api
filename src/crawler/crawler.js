/// 依赖模块
var request = require("request"),
    path = require('path'),
    fs = require('fs'),
    cheerio = require("cheerio"),
    iciba = new (require('../api/iciba'))(),
    vocabularyDAO = require('../model/vocabularyDAO');

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
    headers: '',
    filter: /^(?:JS|CSS|HTML|UI)|(?:JS|CSS|HTML|UI)$/ig
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
    var _this = this,
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
        vocabularyDAO.exist(word, function(data){
            if(!data){
                _query(word,description);
            }
        });
    };

    var _query = function(word,description){
        iciba.query(word.replace(config.filter,''), null, function (err, result) {
            if (err) {
                console.warn(err);
                return;
            }
            _saveDB({
                word: word,
                related: word,
                description: description,
                mp3: (result.spells[1] && result.spells[1].mp3) || ''
            });
            if(++i>=len){
                _this.output();
            }
        });
    };

    var _saveDB = function(data){
        vocabularyDAO.save(data, function(err){
            if(err) {
                console.warn(err);
            } else {
                console.log(data.word + " Success!");
            }
        });
    };

    items.each(function(i, elem){
        word = $(elem).find('.info').text().trim();
        description = $(elem).find('.intro').text().trim();
        //_getIciba(word, description);
        console.log(word,_this.splitWord(word));
    });

    //_this.output();
};

Crawler.prototype.splitCamelCase = function(word){
    var wordGroup = [];
    var wordGroupTemp = [];
    var filter = /[\w]+?(?=[A-Z])/g;
    var i = 0, len = word.length, match;
    while(match = filter.exec(word)){
        wordGroupTemp.push(match[0]);
        i = match.index + match[0].length;
    }
    if(i === 0){
        wordGroupTemp.push(word);
    }else if(i < len){
        wordGroupTemp.push(word.substring(i));
    }
    for(i = 0, len = wordGroupTemp.length; i < len; i++){
        if(wordGroupTemp[i].length > 1){
            wordGroup.push(wordGroupTemp[i]);
        }else{
            var letter = wordGroupTemp[i];//合并多个大写字符
            for(var j = i+1; j < wordGroupTemp.length && wordGroupTemp[j].length === 1; j++, i++){
                letter +=  wordGroupTemp[j];
            }
            wordGroup.push(letter);
        }
    }
    return wordGroup;
};

Crawler.prototype.splitSpecialCase = function(word){
    var wordGroup = [];
    var filter = /^(?:JS|CSS|HTML)|(?:JS|CSS|HTML)$/ig;
    var i = 0, len = word.length, match;
    while(match = filter.exec(word)){
        if(match.index > i){
            wordGroup.push(word.substring(i,match.index));
        }
        wordGroup.push(match[0]);
        i = match.index + match[0].length;
    }
    if(i === 0){
        wordGroup.push(word);
    }else if(i < len){
        wordGroup.push(word.substring(i));
    }
    return wordGroup;
};

Crawler.prototype.splitWord = function(word){
    var wordGroup = word.split(/[\s\.-]/);
    if(wordGroup.length === 1){//进行驼峰分词
        wordGroup = this.splitCamelCase(word);
    }
    if(wordGroup.length === 1){//进特殊分词
        wordGroup = this.splitSpecialCase(word);
    }
    return wordGroup;
};

Crawler.prototype.output = function(){
    var _writeFile = function(vocabulary){
            var file = path.join(dataDir, 'vocabulary1.json');
            fs.writeFile(file, JSON.stringify(vocabulary), {encoding: 'utf-8', flag: 'w'}, function (err) {
                if (err) {
                    throw err;
                }
            });
        };
    vocabularyDAO.find(vocabularyDAO.FIND_PREFECT_WORD,function(err, vocabulary){
        if (err) {
            console.warn(err);
            return;
        }
        console.log('写入数量:'+vocabulary.length);
        _writeFile(vocabulary);
        console.log(config.url + '分析完成');
    });
};

module.exports = Crawler;
