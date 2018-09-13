'use strict';
const express = require('express'),
    app = express(),
    httpApp = express(),
    cors = require('cors'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    Task = require('./models/todoListModel'),
    User = require('./models/userModel'),
    TypeDrive = require('./models/typeDriveModel'),
    UserDoc = require('./models/userDocModel'),
    Referral = require('./models/referralModel'),
    Code = require('./models/codeModel'),
    bodyParser = require('body-parser'),
    path = require('path'),
    {autoruntime} = require('./routes/autodelete'),
    {removeOnline} = require('./controllers/onlineController'),
    jsonwebtoken = require("jsonwebtoken");

const http = require('http');
const https = require('https');
const config = require("./config");
//const ca = fs.readFileSync(__dirname +'ssl/COMODORSADomainValidationSecureServerCA.crt', 'utf8');
const credentials = {
    key: fs.readFileSync(__dirname + '/ssl/key.pem'),
    cert: fs.readFileSync(__dirname + '/ssl/cert.pem'),
    // ca: [fs.readFileSync(__dirname +'/ssl/ca.pem')],
};

httpApp.set('port', process.env.PORT || 80);
httpApp.get("*", function (req, res, next) {
    res.redirect("https://" + req.headers.host + req.path);
});

const httpServer = http.createServer(httpApp);
const httpsServer = https.createServer(credentials, app);

const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');


mongoose.Promise = global.Promise;
mongoose.connect(config.database, {useNewUrlParser: true});
app.set('port', process.env.PORT || 443);
app.set('host', process.env.HOST || '');
app.enable('trust proxy');
app.set('uploads', './public/uploads');
app.use(express.static('public'));
app.use(express.static('swagger-ui'));


app.use(bodyParser.json({limit: "20mb"}));
app.use(bodyParser.urlencoded({limit: "20mb", extended: true, cookie: {maxAge: 86400000}}));
// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.set('view engine', 'ejs'); // set up ejs for templating
app.set('views', './views'); // set up ejs for templating
// required for passport
app.use(session({secret: config.secret, resave: true, saveUninitialized: true})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
require('./config/passport')(passport); // pass passport for configuration
// routes ======================================================================
require('./routes/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
// uncomment this line
app.use(cors());

app.use(function (req, res, next) {
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === config.bearer) {
        jsonwebtoken.verify(req.headers.authorization.split(' ')[1], config.secret, function (err, decode) {
            if (err) req.user = undefined;
            req.user = decode;
            next();
        });
    } else {
        req.user = undefined;
        next();
    }
});

// routes api
require('./routes/todoListRoutes')(app);


// socket
require('./routes/socket')(httpsServer);



//reactjs front end
app.use(express.static(path.join(__dirname, 'pawnvnadmin')));
app.get('/admin', function (req, res) {
    res.sendFile(path.join(__dirname, 'pawnvnadmin', 'pawnvnadmin.html'));
});

app.use(express.static(path.join(__dirname, 'pawnvn')));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'pawnvn', 'index.html'));
});




app.use(function (req, res) {
    res.status(404).send({url: req.originalUrl + ' not found'})
});
// goi ham tự đọng xóa có hẹn giờ
autoruntime();

httpServer.listen(httpApp.get('port'), function () {
    console.log('Express HTTP server listening on port ' + httpApp.get('port'));
});

httpsServer.listen(app.get('port'), app.get('host'), function () {
    console.log('Express HTTPS server listening on port ' + app.get('port'));
});

module.exports = app;

