'use strict';

var
    Iciba = require('../src/api/iciba.js'),
    APIKEY = 'C231706B1BCAAE8D3CEB0E70B5AF138A',
    iciba = new Iciba(APIKEY),
    crawler = new (require('../src/crawler'))();

var debug = {
    'test1': function () {
        iciba.dict('apple', function (err, res) {
            if (err) {
                console.warn(err);
            } else {
                console.log(res);
            }
        });
    },
    'test2': function () {
        iciba.query('apple',null, function (err, res) {
            if (err) {
                console.warn(err);
            } else {
                console.log(res);
            }
        });
    },
    'test3': function () {
        iciba.dict2('apple', function (err, res) {
            if (err) {
                console.warn(err);
            } else {
                console.log(res);
            }
        });
    },
    'test4': function(){
        crawler.start();
    }
};

//require('events').EventEmitter.prototype._maxListeners = 100;

/*debug.test1();
debug.test2();
debug.test3();*/
debug.test4();