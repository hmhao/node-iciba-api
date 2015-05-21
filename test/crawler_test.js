'use strict';

var fs = require('fs'),
    cheerio = require("cheerio"),
    crawler = new (require('../src/crawler'))();

/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)                         // 指定一个测试内期望被执行的断言数量，确保你的回调和断言被执行到了。
 test.done()                                        // 结束当前的测试函数并继续执行下一个
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */

exports['awesome'] = {
    setUp: function (done) {
        // setup here
        done();
    }/*,
    'request': function (test) {
        test.expect(2);
        var url =  'http://div.io/digg';
        crawler.request(url, function (status, $) {
            test.equal(status, true, url + ' request fail');
            if(status)
                test.notEqual($, null, 'should return sth.');
            test.done();
        });
    },
    'getWordsFromHTML': function (test) {
        var html = '<div class="digg-list"><ul><li rel="203"><p class="info"><a href="http://www.pagurian.com/" data-url="http://div.io/digg/go/203" class="title" target="_blank">Pagurian</a></p><p class="thumb"><a href="http://www.pagurian.com/" data-url="http://div.io/digg/go/203" target="_blank"><img src="http://div.io/uploads/screenshot/203_m.png"></a></p><div class="additional-icon"><p><i class="fa fa-eye"></i><strong>31</strong></p><p><a href="http://div.io/digg/like/203"><i class="iconfont icon-zanyang"></i><strong>1</strong></a></p><p class="project-user"><i class="fa fa-user"></i><a href="http://div.io/user/simonet">simonguo</a></p></div><div class="additional-info"><p class="intro"><span>管理系统的前端解决方案， 致力于让前端设计，开发，测试，发布更简单</span></p></div></li><li rel="198"><p class="info"><a href="http://wellcaffeinated.net/PhysicsJS/" data-url="http://div.io/digg/go/198" class="title" target="_blank">PhysicsJS</a></p><p class="thumb"><a href="http://wellcaffeinated.net/PhysicsJS/" data-url="http://div.io/digg/go/198" target="_blank"><img src="http://div.io/uploads/screenshot/198_m.png"></a></p><div class="additional-icon"><p><i class="fa fa-eye"></i><strong>43</strong></p><p><a href="http://div.io/digg/like/198"><i class="iconfont icon-zanyang"></i><strong>0</strong></a></p><p class="project-user"><i class="fa fa-user"></i><a href="http://div.io/user/nan">zhoucongjun</a></p></div><div class="additional-info"><p class="intro"><span>A modular, extendable, and easy-to-use physics engine for javascript</span></p></div></li><li rel="197"><p class="info"><a href="http://codemirror.net/" data-url="http://div.io/digg/go/197" class="title" target="_blank">CodeMirror</a></p><p class="thumb"><a href="http://codemirror.net/" data-url="http://div.io/digg/go/197" target="_blank"><img src="http://div.io/uploads/screenshot/197_m.png"></a></p><div class="additional-icon"><p><i class="fa fa-eye"></i><strong>27</strong></p><p><a href="http://div.io/digg/like/197"><i class="iconfont icon-zanyang"></i><strong>0</strong></a></p><p class="project-user"><i class="fa fa-user"></i><a href="http://div.io/user/nan">zhoucongjun</a></p></div><div class="additional-info"><p class="intro"><span>CodeMirror is a versatile text editor implemented in JavaScript for the browser.</span></p></div></li><li rel="83"><p class="info"><a href="http://flatironjs.org/" data-url="http://div.io/digg/go/83" class="title" target="_blank">Flatiron</a></p><p class="thumb"><a href="http://flatironjs.org/" data-url="http://div.io/digg/go/83" target="_blank"><img src="http://div.io/uploads/screenshot/83_m.png"></a></p><div class="additional-icon"><p><i class="fa fa-eye"></i><strong>27</strong></p><p><a href="http://div.io/digg/like/83"><i class="iconfont icon-zanyang"></i><strong>0</strong></a></p><p class="project-user"><i class="fa fa-user"></i><a href="http://div.io/user/berg">berg</a></p></div><div class="additional-info"><p class="intro"><span>an adaptable framework for building modern web applications</span></p></div></li><li rel="155"><p class="info"><a href="http://cssplant.com/clip-path-generator" data-url="http://div.io/digg/go/155" class="title" target="_blank">css3 clip辅助工具</a></p><p class="thumb"><a href="http://cssplant.com/clip-path-generator" data-url="http://div.io/digg/go/155" target="_blank"><img src="http://div.io/uploads/screenshot/155_m.png"></a></p><div class="additional-icon"><p><i class="fa fa-eye"></i><strong>81</strong></p><p><a href="http://div.io/digg/like/155"><i class="iconfont icon-zanyang"></i><strong>0</strong></a></p><p class="project-user"><i class="fa fa-user"></i><a href="http://div.io/user/nan">zhoucongjun</a></p></div><div class="additional-info"><p class="intro"><span>一个css3 image clip 辅助工具</span></p></div></li><li rel="101"><p class="info"><a href="http://www.colordic.org/y/" data-url="http://div.io/digg/go/101" class="title" target="_blank">世界の伝統色</a></p><p class="thumb"><a href="http://www.colordic.org/y/" data-url="http://div.io/digg/go/101" target="_blank"><img src="http://div.io/uploads/screenshot/101_m.png"></a></p><div class="additional-icon"><p><i class="fa fa-eye"></i><strong>197</strong></p><p><a href="http://div.io/digg/like/101"><i class="iconfont icon-zanyang"></i><strong>1</strong></a></p><p class="project-user"><i class="fa fa-user"></i><a href="http://div.io/user/berg">berg</a></p></div><div class="additional-info"><p class="intro"><span>来自日本的配色词典</span></p></div></li><li rel="100"><p class="info"><a href="http://nipponcolors.com/" data-url="http://div.io/digg/go/100" class="title" target="_blank">Nippon Colors</a></p><p class="thumb"><a href="http://nipponcolors.com/" data-url="http://div.io/digg/go/100" target="_blank"><img src="http://div.io/uploads/screenshot/100_m.png"></a></p><div class="additional-icon"><p><i class="fa fa-eye"></i><strong>333</strong></p><p><a href="http://div.io/digg/like/100"><i class="iconfont icon-zanyang"></i><strong>0</strong></a></p><p class="project-user"><i class="fa fa-user"></i><a href="http://div.io/user/berg">berg</a></p></div><div class="additional-info"><p class="intro"><span>来自日本的配色方案，交互很炫。</span></p></div></li></ul></div>';
        var $ = cheerio.load(html);
        var words = crawler.getWordsFromHTML($);
        console.log(words);
        test.ok(words.length > 0, 'html error');
        test.done();
    },
    'query': function (test) {
        var word = {
            word: 'Pagurian',
            description: '管理系统的前端解决方案， 致力于让前端设计，开发，测试，发布更简单'
        };
        crawler.query(word, function(err, res){
            test.equal(err, null, 'should be no error');
            test.notEqual(res, null, 'should return sth.');
            console.log(res);
            test.done();
        });
    },
    'output': function(test){
        crawler.output(function(err, res){
            test.equal(err, null, 'should be no error.');
            test.notEqual(res, null, 'should return sth.');
            test.ok(fs.existsSync(res), 'result file no exists');
            test.done();
        });
    }*/,
    'handleWords': function(test){
        var words = [{
            word: 'Pagurian',
            description: '管理系统的前端解决方案， 致力于让前端设计，开发，测试，发布更简单'
        }, {
            word: 'CodeMirror',
            description: 'CodeMirror is a versatile text editor implemented in JavaScript for the browser.'
        }, {
            word: 'css3 clip',
            description: '一个css3 image clip 辅助工具'
        }];
        crawler.handleWords(words,function(err, res){
            test.equal(err, null, 'should be no error.');
            test.notEqual(res, null, 'should return sth.');
            test.ok(fs.existsSync(res), 'result file no exists');
            test.done();
        });
    }
    /*,
    'splitCamelCase': function(test){
        //var word = 'squashOurJSMethodNamesUITogetherLikeThis';
        var word = 'splitOurJSMethod';
        var wordgroup = crawler.splitCamelCase(word);
        //console.log(word,wordgroup);
        test.ok(wordgroup.length > 0, 'length must > 0');
        if(wordgroup.length){
            test.ok(wordgroup[0] === 'split', 'split error');
            test.ok(wordgroup[1] === 'Our', 'split error');
            test.ok(wordgroup[2] === 'JS', 'split error');
            test.ok(wordgroup[3] === 'Method', 'split error');
        }
        test.done();
    },
    'splitSpecialCase': function (test) {
        var word = 'jsperfUI';
        var wordgroup = crawler.splitSpecialCase(word);
        //console.log(word,wordgroup);
        test.ok(wordgroup.length > 0, 'length must > 0');
        if(wordgroup.length){
            test.ok(wordgroup[0] === 'js', 'split error');
            test.ok(wordgroup[1] === 'perfUI', 'split error');
        }
        test.done();
    },
    'splitWord': function (test) {
        var word = 'jsperfUISplitOurJSMethod';
        var wordgroup = crawler.splitWord(word);
        console.log(word,wordgroup);
        test.done();
    }*/
};

