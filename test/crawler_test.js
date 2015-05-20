'use strict';

var crawler = new (require('../src/crawler'))();

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
    },/*
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
    'analyse': function (test) {
        test.done();
    },*/
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
            test.ok(wordgroup[1] === 'perf', 'split error');
            test.ok(wordgroup[2] === 'UI', 'split error');
        }
        test.done();
    },
    'splitWord': function (test) {
        var word = 'jsperfUISplitOurJSMethod';
        var wordgroup = crawler.splitWord(word);
        console.log(word,wordgroup);
        test.done();
    }/*,
    'output': function(test){
        //crawler.output();
        test.done();
    }*/
};

