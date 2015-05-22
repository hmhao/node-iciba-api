/// 依赖模块
var request = require("request"),
    path = require('path'),
    fs = require('fs'),
    async = require('async'),
    cheerio = require("cheerio"),
    audiosprite = require('../audiosprite'),
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
    headers: ''
};

var Crawler = function () {
    console.log('生成爬虫');
};

/**获取页面
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

/**开始处理的入口*/
Crawler.prototype.start = function () {
    var _this = this;
    _this.request(config.url, function (status, $) {
        if (status) {
            var words = _this.getWordsFromHTML($);
            if (words.length) {
                _this.handleWords(words, function (err, res) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log('output url:' + res);
                    console.log(config.url + '分析完成');
                });
            }
        } else {
            console.log(config.url + '请求失败');
        }
    });
};

/**
 * $:{Object} cheerio实例
 *
 * Return: {Array}  eg.[{word: '', description: ''},{word: '', description: ''},...]
 * */
Crawler.prototype.getWordsFromHTML = function ($) {
    var items = $('div.digg-list>ul>li'),
        enRegexp = /^([\w\s\.-]+)/g,
        words = [], word, match;
    console.log('获取数量:' + items.length);
    items.each(function (i, elem) {
        word = $(elem).find('.info').text().trim();
        enRegexp.lastIndex = 0;
        if (match = enRegexp.exec(word)) {
            word = match[1].trim();
            words.push({
                word: word,
                description: $(elem).find('.intro').text().trim()
            });
        } else {
            console.log('剔除:' + word);
        }
    });
    return words;
};

/**查询单词
 * word:{Object}    eg.{word: '', description: ''}
 * callback:{Function}  eg.function(err, res)
 * */
Crawler.prototype.query = function (word, callback) {
    var data = {
            word: word.word,
            related: word.related || word.word,
            description: word.description,
            mp3: ''
        },
        wordGroup = this.splitWord(word.word);

    audiosprite(wordGroup, function (err, url) {
        if (err) {
            callback(err, null);
            return;
        }
        data.mp3 = url;
        callback(null, data);
    });
};

/**输出json文件
 * callback:{Function}  eg.function(err, res)   res为json文件路径
 * */
Crawler.prototype.output = function (callback) {
    vocabularyDAO.find(vocabularyDAO.FIND_PREFECT_WORD, function (err, vocabulary) {
        if (err) {
            callback(err, null);
            return;
        }
        console.log('写入数量:' + vocabulary.length);
        var file = path.join(dataDir, 'vocabulary1.json');
        fs.writeFile(file, JSON.stringify(vocabulary), {encoding: 'utf-8', flag: 'w'}, function (err) {
            if (err) {
                throw err;
            }
            callback(null, file);
        });
    });
};

/**处理词汇
 * words: [{word: '', description: ''},{word: '', description: ''},...]
 * callback:{Function}  eg.function(err, res)   res为json文件路径
 * */
Crawler.prototype.handleWords = function (words, callback) {
    var _this = this;
    async.forEachSeries(words, function (word, next) {
        vocabularyDAO.exist(word.word, function(data){
            if(!data){
                _this.query(word, function (err, res) {
                    if (err) {
                        callback(err);
                        next();
                        return;
                    }
                    vocabularyDAO.save(res, function (err) {
                        if (err) {
                            callback(err);
                        }
                    });
                    next();
                });
            }else{
                next();
            }
        });
    }, function (err) {
        if (err) {
            callback(err);
            return;
        }
        _this.output(callback);
    });
};

/**分拆驼峰词*/
Crawler.prototype.splitCamelCase = function (word) {
    var wordGroup = [];
    var wordGroupTemp = [];
    var filter = /[0-9](?=[a-z])|[\w]+?(?=[A-Z0-9])/g;
    var i = 0, len = word.length, match;
    while (match = filter.exec(word)) {
        wordGroupTemp.push(match[0]);
        i = match.index + match[0].length;
    }
    if (i === 0) {
        wordGroupTemp.push(word);
    } else if (i < len) {
        wordGroupTemp.push(word.substring(i));
    }
    for (i = 0, len = wordGroupTemp.length; i < len; i++) {
        if (wordGroupTemp[i].length > 1) {
            wordGroup.push(wordGroupTemp[i]);
        } else {
            var letter = wordGroupTemp[i];//合并多个大写字符和数字
            for (var j = i + 1; j < wordGroupTemp.length && wordGroupTemp[j].length === 1; j++, i++) {
                letter += wordGroupTemp[j];
            }
            wordGroup.push(letter);
        }
    }
    return wordGroup;
};

/**分拆特殊词*/
Crawler.prototype.splitSpecialCase = function (word) {
    var wordGroup = [];
    var filter = /^(?:JS|CSS|HTML)|(?:JS|CSS|HTML)$/ig;
    var i = 0, len = word.length, match;
    while (match = filter.exec(word)) {
        if (match.index > i) {
            wordGroup.push(word.substring(i, match.index));
        }
        wordGroup.push(match[0]);
        i = match.index + match[0].length;
    }
    if (i === 0) {
        wordGroup.push(word);
    } else if (i < len) {
        wordGroup.push(word.substring(i));
    }
    return wordGroup;
};

/**分拆词*/
Crawler.prototype.splitWord = function (word) {
    var wordGroup = word.split(/[\s\.-]/);
    if (wordGroup.length === 1) {//进行驼峰分词
        wordGroup = this.splitCamelCase(word);
    }
    if (wordGroup.length === 1) {//进特殊分词
        wordGroup = this.splitSpecialCase(word);
    }
    return wordGroup;
};

module.exports = Crawler;
