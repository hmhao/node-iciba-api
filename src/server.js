var express = require('express'),
    router = require('./routes/index'),
    app = express();

app.use('/', router);

app.listen(8080,function(){
    console.log('App listening on port 8080');
});



