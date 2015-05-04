var APIKEY = 'C231706B1BCAAE8D3CEB0E70B5AF138A',
    Iciba = require('../api/iciba'),
    iciba = new Iciba(APIKEY),
    express = require('express'),
    router = express.Router();

router.get('/api', function(req, res) {
    var isDict = !!req.query.dict;
    var word = req.query.q || req.query.dict || '',
        type = req.query.t || 'auto';//auto,en-zh,zh-en...

    var reqHandler = (function(res){
        return function (err, result){
            if(err){
                //console.warn(err);
            }else{
                //console.log(result);
                res.send(result);
            }
        };
    })(res);

    if(word){
        if(isDict){
            iciba.dict(word, reqHandler);
        }else{
            iciba.query(word, type, reqHandler);
        }
    }
});

module.exports = router;
