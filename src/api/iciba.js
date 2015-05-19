var request = require('request'),
    cheerio = require('cheerio'),
    Iciba = function (key) {
        this.key = key;
    };

Iciba.prototype.query = function (word, type, fn) {
    var url;
    type = type || 'auto';
    url = "http://fy.iciba.com/api.php";
    return request.post(url, {form: {q: word, type: type}}, function (err, res, data) {
        if (err) {
            return fn('API request fail');
        }
        var json = JSON.parse(data);
        var result = {
            word: word,
            type: [json.from + ' -> ' + json.to, json.type],
            spells: [],
            translations: []
        };
        var $ = cheerio.load(json.ret, {
            ignoreWhitespace: true,
            xmlMode: true
        });
        //console.log($.html());
        var i,len;
        var eg,spell,linkClickFn,match,trans;
        //音标
        for (eg = $('.pron .eg'), i = 0, len = eg.length; i < len; i++) {
            spell = eg.eq(i);
            linkClickFn = spell.find('a').attr('onclick');
            match = /'(.*?mp3)'/g.exec(linkClickFn);
            if (match) {
                result.spells.push({
                    text: spell.text(),
                    mp3: match[1]
                });
            }
        }
        //翻译
        for (trans = $('.dTrans'), i = 0, len = trans.length; i < len; i++) {
            result.translations.push({
                type: trans.find('.dt').eq(i).text(),
                desc: trans.find('.dd').eq(i).text()
            });
        }
        //console.log(result);
        return fn(null, result);
    });
};

Iciba.prototype.dict = function (word, fn) {
    var url;
    url = "http://dict-co.iciba.com/api/dictionary.php?w=" + word + "&key=" + this.key;
    return request.get(url, function (err, res, data) {
        if (err) {
            return fn('API request fail');
        }
        var result = {
            word: word,
            spells: [],
            translations: [],
            examples: []
        };
        var $ = cheerio.load(data, {
            ignoreWhitespace: true,
            xmlMode: true
        });
        //console.log($.html());
        var i,len;
        var ps,pos,sent,example;
        //音标
        for (ps = $('ps'), i = 0, len = ps.length; i < len; i++) {
            result.spells.push({

                text: "[" + ps.text() + "]",
                mp3: $('pron').eq(i).text()
            });
        }
        //翻译
        for (pos = $('pos'), i = 0, len = pos.length; i < len; i++) {
            result.translations.push({
                type: pos.eq(i).text(),
                desc: $('acceptation').eq(i).text().trim()
            });
        }
        //例句
        for (sent = $('sent'), i = 0, len = sent.length; i < len; i++) {
            example = sent.eq(i);
            result.examples.push({
                en: example.find('orig').text().trim(),
                cn: example.find('trans').text().trim()
            });
        }
        //console.log(result);
        return fn(null, result);
    });
};

Iciba.prototype.dict2 = function(word, fn){
    var url = "http://www.iciba.com/";
    return request(url, function(error, response) {//需要先访问主页获取cookie后查询才不会被屏蔽
        var options = {
            url: url + word,
            headers: {
                'set-cookie':response.headers['set-cookie']
            }
        };
        request(options, function (err, res, data) {
            if (err) {
                return fn('API request fail');
            }
            var result = {
                word: word,
                spells: [],
                translations: [],
                examples: []
            };
            var $ = cheerio.load(data, {
                ignoreWhitespace: true,
                xmlMode: true
            });
            //console.log($.html());
            var dictbar = $('#dict_main .dictbar');
            var i, len;
            var eg, spell, linkClickFn, match, pos, sent, example;
            //音标
            for (eg = dictbar.find('.dict_title .prons .eg'), i = 0, len = eg.length; i < len; i++) {
                spell = eg.eq(i);
                linkClickFn = spell.find('a').attr('onclick');
                match = /'(.*?mp3)'/g.exec(linkClickFn);
                if (match) {
                    result.spells.push({
                        text: spell.find('.fl').text(),
                        mp3: match[1]
                    });
                }
            }

            //翻译
            for (pos = dictbar.find('.group_prons .group_pos'), i = 0, len = pos.length; i < len; i++) {
                result.translations.push({
                    type: pos.eq(i).find('.fl').text(),
                    desc: pos.eq(i).find('.label_list').text().trim()
                });
            }

            //例句
            for (sent = dictbar.siblings('.simple').find('.tab_content1 dl'), i = 0, len = sent.length; i < len; i++) {
                example = sent.eq(i);
                result.examples.push({
                    en: example.find('dt').text().replace(/^\d\./, '').trim(),
                    cn: example.find('dd').text().trim()
                });
            }
            //console.log(result);
            return fn(null, result);
        });
    });
};

Iciba.prototype.get = function(word, fn){
    var apis = ['dict2','dict'];
    var _this = this;
    _this.query(word,null,function(err, res){
        if(err || !res.spells.length){
            if(apis.length){
                _this[apis.pop()](word,arguments.callee);
            }else{
                fn(null,res);
            }
        }else{
            fn(null,res);
        }
    });
};

module.exports = Iciba;
