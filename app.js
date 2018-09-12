var express = require('express'),
    http = require('http'),
    https = require('https'),
    fs = require('fs'),
    path = require('path'),
    httpApp = express(),
    app = express(),
    certPath = "ssl";


var httpsOptions = {
    key: fs.readFileSync(path.join(__dirname,certPath, "key.pem")),
    cert: fs.readFileSync(path.join(__dirname,certPath, "cert.pem"))
};

httpApp.set('port', process.env.PORT || 80);
httpApp.get("*", function (req, res, next) {
    res.redirect("https://" + req.headers.host +  req.path);
});


// all environments

app.set('port', process.env.PORT || 443);
app.set('host', process.env.HOST || '');
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.enable('trust proxy');
// app.use(express.favicon());
// app.use(express.logger('dev'));
// app.use(express.bodyParser());
// app.use(express.methodOverride());
// app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use (function (req, res, next) {
    if (req.protocol === 'https') {
        console.log(req.protocol, req.secure);
        next();
    } else {
        console.log('redirected');
        res.redirect('https://' + req.headers.host + req.url);
    }
});


//reactjs
app.use(express.static(path.join(__dirname, 'build')));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});



http.createServer(httpApp).listen(httpApp.get('port'), function() {
    console.log('Express HTTP server listening on port ' + httpApp.get('port'));
});

https.createServer(httpsOptions, app).listen(app.get('port'),app.get('host'), function() {
    console.log('Express HTTPS server listening on port ' + app.get('port'));
});