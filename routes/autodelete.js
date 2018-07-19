const cron = require('node-cron');
const fsextra = require('fs-extra');
const config = require('../config');
const pawn = require('../controllers/pawnController');

exports.autoruntime = function() {
    cron.schedule('* 12 * * *', function(){
        console.log('running a task every 23 clock');
        pawn.delete_all_pawn_trash();
        fsextra.removeSync(`${config.folder_temp}`);
    });
}