var express = require('express'),
    router = require('./routes'),
    crawler = new (require('./crawler'))(),
    app = express();

app.use('/', router);

app.listen(8080, function () {
    console.log('App listening on port 8080');
});

crawler.start();