'use strict';

module.exports = function (app) {
    let todoList = require('../controllers/todoListController');
    let userHandles = require('../controllers/userController');
    let captcha = require('../controllers/captchaController');
    let codeVerify = require('../controllers/codeController');
    let pawn = require('../controllers/pawnController');
    let city = require('../controllers/cityController');
    let category = require('../controllers/categoryController');
    let wallets = require('../controllers/walletsController');
    let history = require('../controllers/tradeHistoryController');
    let terms = require('../controllers/termsController');
    let socketController = require('../controllers/socketController');
    // insert document socket
    app.route('/api/insert-tutorial-socket')
        .post( socketController.insert_one);

    //get wallet user
    app.route('/api/insert-terms')
        .post(userHandles.loginRequired, terms.insert_terms);
    app.route('/api/update-terms')
        .post(userHandles.loginRequired, terms.update_terms);
    app.route('/api/get-terms')
        .post( terms.get_tems_title);
    app.route('/api/get-all-pages')
        .get(terms.get_all_term);
    app.route('/api/delete-page')
        .post(userHandles.loginRequired,terms.delete_page);

    //get wallet user
    app.route('/api/history/get')
        .post(userHandles.loginRequired, history.find_all_history);

    //get wallet user
    app.route('/api/wallet/get')
        .post(userHandles.loginRequired, wallets.find_one_wallet);
    //update wallet user
    app.route('/api/wallet/update')
        .post(userHandles.loginRequired, wallets.update_wallet_user);

    //get, insert category
    app.route('/api/category')
        .get(category.list_categories)
        .post(userHandles.loginRequired, category.insert_one);
    app.route('/api/category/update')
        .post(userHandles.loginRequired, category.update_cat);
    app.route('/api/category/update-image')
        .post(userHandles.loginRequired, category.update_cat_image);
    app.route('/api/category/delete')
        .post(userHandles.loginRequired, category.delete_cat);

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
        .get(userHandles.loginRequired, userHandles.get_info);

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

    app.route('/api/pawn/get-info-auction-user')
        .post(userHandles.loginRequired, pawn.list_auction_of_pawn);

    app.route('/api/pawn/not-view-pawn')
        .post(userHandles.loginRequired, pawn.not_view_pawn);

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
