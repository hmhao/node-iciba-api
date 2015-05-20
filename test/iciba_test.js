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

exports['awesome'] = {
    setUp: function (done) {
        // setup here
        done();
    },
    'iciba_dict': function (test) {
        test.expect(2);
        iciba.dict('apple', function (err, res) {
            test.equal(err, null, 'should be no error');
            test.notEqual(res, null, 'should return sth.');
            test.done();
        });
    },
    'iciba_query': function (test) {
        test.expect(2);
        iciba.query('apple',null, function (err, res) {
            test.equal(err, null, 'should be no error');
            test.notEqual(res, null, 'should return sth.');
            test.done();
        });
    },
    'iciba_dict2': function (test) {
        test.expect(2);
        iciba.dict2('apple', function (err, res) {
            test.equal(err, null, 'should be no error');
            test.notEqual(res, null, 'should return sth.');
            test.done();
        });
    },
    'iciba_get': function (test) {
        test.expect(2);
        iciba.get('apple', function (err, res) {
            test.equal(err, null, 'should be no error');
            test.notEqual(res, null, 'should return sth.');
            test.done();
        });
    }
};