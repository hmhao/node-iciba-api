var APIKEY = 'C231706B1BCAAE8D3CEB0E70B5AF138A',
    Iciba = require('../api/iciba'),
    iciba = new Iciba(APIKEY),
    express = require('express'),
    router = express.Router(),
    path = require('path'),
    fs = require('fs');

var root = path.join(__dirname, '../../');
var dataDir = path.join(root, 'data');
fs.exists(dataDir, function (exists) {
    if (!exists) {
        fs.mkdir(dataDir);
    }
});

var userVocabulary;
var file = path.join(dataDir, 'vocabulary.json');
fs.readFile(file, {encoding: 'utf-8', flag: 'a+'}, function (err, data) {
    if (err) {
        throw err;
    }
    if (data) {
        userVocabulary = JSON.parse(data);
    }else{
        userVocabulary = {};
    }
});

router.get('/api', function (req, res) {
    var isDict = !!req.query.dict;
    var word = req.query.q || req.query.dict || '',
        type = req.query.t || 'auto';//auto,en-zh,zh-en...

    var reqHandler = (function (res) {
        return function (err, result) {
            if (err) {
                //console.warn(err);
            } else {
                //console.log(result);
                res.send(result);
            }
        };
    })(res);

    if (word) {
        if (isDict) {
            iciba.dict(word, reqHandler);
        } else {
            iciba.query(word, type, reqHandler);
        }
    }
});


router.get('/api/v', function (req, res) {
    var word = req.query.q || '',
        type = req.query.t || 'auto';//auto,en-zh,zh-en...

    if (word) {
        if(userVocabulary[word]){
            res.send(userVocabulary[word]);
        }else{
            iciba.query(word, type, function (err, result) {
                if (err) {
                    //console.warn(err);
                } else {
                    //console.log(result);
                    userVocabulary[result.word] = {
                        word: result.word,
                        related: '',
                        description: '',
                        mp3: result.spells[1].mp3
                    }
                    fs.writeFile(file, JSON.stringify(userVocabulary), {encoding: 'utf-8', flag: 'w+'}, function (err) {
                        if (err) {
                            throw err;
                        }
                    });
                    res.send(userVocabulary[result.word]);
                }
            });
        }
    }
});

module.exports = router;
