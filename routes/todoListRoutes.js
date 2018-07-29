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
    let wallets = require('../controllers/walletsController');
    let history = require('../controllers/tradeHistoryController');

    // todoList Routes
    //get wallet user
    app.route('/api/history/get')
        .post(userHandles.loginRequired, history.find_all_history);

    //get wallet user
    app.route('/api/wallet/get')
        .post(userHandles.loginRequired, wallets.find_one_wallet);
    //update wallet user
    app.route('/api/wallet/update')
        .post(userHandles.loginRequired, wallets.update_wallet_user);

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

    app.route('/api/auth/sign-in-admin')
        .post(userHandles.sign_in_admin);

    app.route('/api/auth/get-info')
        .get(userHandles.loginRequired,userHandles.get_info);

    app.route('/api/auth/register-web')
        .post(userHandles.register_old);

    app.route('/api/auth/register-user-pass')
        .post(userHandles.register_user_pass);

    app.route('/api/auth/sendsms')
        .post(userHandles.send_code_again);

    app.route('/api/auth/verify')
        .post(userHandles.verify);

    app.route('/api/auth/avatar')
        .post(userHandles.loginRequired, userHandles.update_avatar);

    app.route('/api/auth/business')
        .get(userHandles.get_all_business);

    app.route('/api/auth/card')
        .post(userHandles.loginRequired, userHandles.update_identityCardFront);

    app.route('/api/auth/doccument')
        .post(userHandles.loginRequired, userHandles.update_userboth);

    app.route('/api/auth/doccumentboth')
        .post(userHandles.loginRequired, userHandles.update_userboth);

    app.route('/api/auth/change-password')
        .post(userHandles.loginRequired, userHandles.update_password);

    app.route('/api/auth/:email')
        .put(userHandles.update_active);

    app.route('/api/auth/profile/:id')
        .put(userHandles.loginRequired, userHandles.update_profile)
        .get(userHandles.loginRequired, userHandles.profile);

    app.route('/api/auth/delete')
        .post(userHandles.loginRequired, userHandles.delete_one_user_by_id);

    app.route('/api/auth/comment')
        .post(userHandles.loginRequired, userHandles.insert_comment);

    app.route('/api/pawn/image')
        .post(userHandles.loginRequired, pawn.insert_image);
    app.route('/api/pawn/doc')
        .post(userHandles.loginRequired, pawn.insert_doc);
    app.route('/api/pawn/list')
        .post(userHandles.loginRequired, pawn.get_list)
        .get(pawn.get_list_all);
    app.route('/api/pawn/one')
        .post(userHandles.loginRequired, pawn.get_one);

    //choose auction pawn
    app.route('/api/choose-auction-pawn')
        .post(userHandles.loginRequired, pawn.choose_pawn_auction);

    app.route('/api/auction-pawn')
        .post(userHandles.loginRequired, pawn.insert_pawn_auction)
        .get(userHandles.loginRequired, pawn.get_pawn_auction_for_business);

    app.route('/api/list-was-auctioned')
        .get(userHandles.loginRequired, pawn.list_was_auctioned);

    app.route('/api/list-pawn-auction-selected')
        .get(userHandles.loginRequired, pawn.list_pawn_auction_selected);

    //api get all user business follow and following
    app.route('/api/user-business-follow')
        .get(userHandles.loginRequired, userHandles.get_all_user_business_follow);
    app.route('/api/user-business-following')
        .get(userHandles.loginRequired, userHandles.get_all_user_business_following);

};
