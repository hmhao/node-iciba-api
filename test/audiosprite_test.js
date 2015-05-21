'use strict';

var audiosprite = require('../src/audiosprite'),
    fs = require('fs');

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

exports.audiosprite = {
    setUp: function (done) {
        // setup here
        done();
    },
    'noError': function(test){
        var words = ['Node', 'JS', 'Web', 'Storm'];
        audiosprite(words, function(err, res){
            test.equal(err, null, 'should be no error.');
            test.notEqual(res, null, 'should return sth.');
            test.ok(fs.existsSync(res), 'result file no exists');
            test.done();
        });
    }/*,
    'wordError': function(test){
        var words = ['Node', '-', 'Web', 'Storm'];
        audiosprite(words, function(err, res){
            test.equal(err, null, 'should be no error');
            test.notEqual(res, null, 'should return sth.');
            test.ok(fs.existsSync(res), 'result file no exists');
            test.done();
        });
    }*/
};