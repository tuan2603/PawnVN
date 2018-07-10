'use strict';

module.exports = function (app) {
    let todoList = require('../controllers/todoListController');
    let userHandles = require('../controllers/userController');
    let captcha = require('../controllers/captchaController');
    let codeVerify = require('../controllers/codeController');
    let pawn = require('../controllers/pawnController');
    let city = require('../controllers/cityController');
    let purchase = require('../controllers/purchaseController');
    let pricelist = require('../controllers/pricelistController');
    let pawnAuction = require('../controllers/pawnAuctionController');
    let purchaseAuction = require('../controllers/purchaseAuctionController');
    let category = require('../controllers/categoryController');

    // todoList Routes
    //get, insert city
    app.route('/api/category')
        .get(category.list_categories)
        .post(userHandles.loginRequired, category.insert_one);

    //get, insert city
    app.route('/api/city')
        .get(city.list_city)
        .post(userHandles.loginRequired, city.insert_many);

    app.route('/api/tasks')
        .get(todoList.list_all_tasks)
        .post(todoList.create_a_task);

    app.route('/api/captcha')
        .post(captcha.recaptcha_verify);

    app.route('/api/verify_code')
        .get(codeVerify.list_all_verify);

    app.route('/api/auth/sign-in-pass-word')
        .post(userHandles.sign_in);

    app.route('/api/auth/register-web')
        .post(userHandles.register_old);

    app.route('/api/auth/register-user-pass')
        .post(userHandles.register_user_pass);

    app.route('/api/auth/sendsms')
        .post(userHandles.send_code_again);

    app.route('/api/auth/verify')
        .post(userHandles.verify);

    app.route('/api/auth/verifyweb')
        .post(userHandles.verify_web);

    app.route('/api/auth/avatar')
        .post(userHandles.loginRequired, userHandles.update_avatar);
    app.route('/api/auth/business')
        .get(userHandles.get_all_business);
    app.route('/api/auth/card')
        .post(userHandles.loginRequired, userHandles.update_identityCardFront);
    app.route('/api/auth/doccument')
        .post(userHandles.loginRequired, userHandles.update_userdoc);
    app.route('/api/auth/doccumentboth')
        .post(userHandles.loginRequired, userHandles.update_userboth);

    app.route('/api/auth/password/:id')
        .put(userHandles.loginRequired, userHandles.update_password);

    app.route('/api/auth/:email')
        .put(userHandles.update_active);

    app.route('/api/auth/profile/:id')
        .put(userHandles.loginRequired, userHandles.update_profile)
        .get(userHandles.loginRequired, userHandles.profile);

    app.route('/api/pawn/image')
        .post(userHandles.loginRequired, pawn.insert_image);
    app.route('/api/pawn/doc')
        .post(userHandles.loginRequired, pawn.insert_doc);
    app.route('/api/pawn/list')
        .post(userHandles.loginRequired, pawn.get_list)
        .get(pawn.get_list_all);
    app.route('/api/pawn/one')
        .post(userHandles.loginRequired, pawn.get_one);

    app.route('/api/purchase/image')
        .post(userHandles.loginRequired, purchase.insert_image);
    app.route('/api/purchase/doc')
        .post(userHandles.loginRequired, purchase.insert_doc);
    app.route('/api/purchase/list')
        .post(userHandles.loginRequired, purchase.get_list)
        .get(purchase.get_list_all);
    app.route('/api/purchase/one')
        .post(userHandles.loginRequired, purchase.get_one);

    app.route('/api/pricelist')
        .post(userHandles.loginRequired, pricelist.insert_pricelist);

    //get list đấu giá cầm đồ
    app.route('/api/pawn-auction/list')
        .post(userHandles.loginRequired, pawnAuction.find_pawn_auction_pawn_id);
    app.route('/api/pawn-auction')
        .post(userHandles.loginRequired, pawnAuction.insert_pawn_auction);
    app.route('/api/pawn-auction/:id')
        .get(userHandles.loginRequired, pawnAuction.find_pawn_auction_id)
        .put(userHandles.loginRequired, pawnAuction.update_pawn_auction_id);

    //get list đấu giá mua đồ
    app.route('/api/purchase-auction/list')
        .post(userHandles.loginRequired, purchaseAuction.find_purchase_auction_purchase_id);
    app.route('/api/purchase-auction')
        .post(userHandles.loginRequired, purchaseAuction.insert_purchase_auction);
    app.route('/api/purchase-auction/:id')
        .get(userHandles.loginRequired, purchaseAuction.find_purchase_auction_id)
        .put(userHandles.loginRequired, purchaseAuction.update_purchase_auction_id);


};
