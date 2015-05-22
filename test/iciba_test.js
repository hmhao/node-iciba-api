'use strict';

var Iciba = require('../src/api/iciba.js'),
    APIKEY = 'C231706B1BCAAE8D3CEB0E70B5AF138A',
    iciba = new Iciba(APIKEY);


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

var word = 'dat';

exports['awesome'] = {
    setUp: function (done) {
        // setup here
        done();
    },
    'iciba_dict': function (test) {
        test.expect(2);
        iciba.dict(word, function (err, res) {
            test.equal(err, null, 'should be no error');
            test.notEqual(res, null, 'should return sth.');
            if(res.spells.length){
                console.log('dict', res.spells);
            }
            test.done();
        });
    },
    'iciba_query': function (test) {
        test.expect(2);
        iciba.query(word, null, function (err, res) {
            test.equal(err, null, 'should be no error');
            test.notEqual(res, null, 'should return sth.');
            if(res.spells.length){
                console.log('query', res.spells);
            }
            test.done();
        });
    },
    'iciba_dict2': function (test) {
        test.expect(2);
        iciba.dict2(word, function (err, res) {
            test.equal(err, null, 'should be no error');
            test.notEqual(res, null, 'should return sth.');
            if(res.spells.length){
                console.log('dict2', res.spells);
            }
            test.done();
        });
    },
    'iciba_get': function (test) {
        test.expect(2);
        iciba.get(word, function (err, res) {
            test.equal(err, null, 'should be no error');
            test.notEqual(res, null, 'should return sth.');
            if(res.spells.length){
                console.log('get', res.spells);
            }
            test.done();
        });
    }
};