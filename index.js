'use strict';
const express = require('express'),
    app = express(),
    cors = require('cors'),
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
    jsonwebtoken = require("jsonwebtoken");

const http = require('http');
const server = http.createServer(app);
const passport = require('passport');
const flash    = require('connect-flash');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const session      = require('express-session');

const config = require("./config");
const port = config.AUrl;
mongoose.Promise = global.Promise;
mongoose.connect(config.database);
app.set('uploads','./public/uploads');
app.use(express.static('public'));
//swagger
app.use(express.static('swagger-ui'));
app.use(bodyParser.json({limit: "20mb"}));
app.use(bodyParser.urlencoded({limit: "20mb", extended: true}));
// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.set('view engine', 'ejs'); // set up ejs for templating
app.set('views', './views'); // set up ejs for templating
// required for passport
app.use(session({ secret: config.secret ,resave :true, saveUninitialized: true})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
require('./config/passport')(passport); // pass passport for configuration
// routes ======================================================================
require('./routes/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
// uncomment this line
app.use(cors());
app.use(function(req, res, next) {
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === config.bearer) {
        jsonwebtoken.verify(req.headers.authorization.split(' ')[1], config.secret, function(err, decode) {
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
const routes = require('./routes/todoListRoutes');
routes(app);

// socket
require('./routes/socket')(server);

//reactjs
app.use(express.static(path.join(__dirname, 'build')));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use(function(req, res) {
    res.status(404).send({ url: req.originalUrl + ' not found' })
});


// goi ham tự đọng xóa có hẹn giờ
autoruntime();

// app.listen(port, function(){
// 	console.log('todo list RESTful API server started on: ' + port);
// });

server.listen(port, () => console.log(`todo list RESTful API server started on: ${port}`));

module.exports = app;
