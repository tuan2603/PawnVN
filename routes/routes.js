const socketdoc = require("../controllers/socketController");
module.exports = function(app, passport) {

    // =====================================
    // SOCKET PAGE (with login links) ========
    // =====================================
    app.get('/testclient',  function(req, res) {
        res.render('testsocket.ejs'); // load the index.ejs file
    });
    // =====================================
    // SOCKET PAGE (with login links) ========
    // =====================================
    app.get('/testbusiness',  function(req, res) {
        res.render('testbusiness.ejs'); // load the index.ejs file
    });

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    // app.get('/swaggers',isLoggedIn,  function(req, res) {
    app.get('/swaggers',  function(req, res) {
        res.render('swaggers.ejs'); // load the index.ejs file
    });
    

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/swaggers', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        res.redirect('/login');
        // render the page and pass in any flash data if it exists
        //res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // SOCKET SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    // app.get('/socket', isLoggedIn, function(req, res) {
    app.get('/socket', function(req, res) {
        socketdoc.findAllSocket()
            .then(sks=>{
                res.render('socket.ejs', {
                    sockets :sks // get the user out of session and pass to template
                });
            },err=>{
                res.render('socket.ejs', {
                    sockets :{} // get the user out of session and pass to template
                });
            })
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}
