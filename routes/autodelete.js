const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const fsextra = require('fs-extra');
const config = require('../config');
const pawn = require('../controllers/pawnController');
const {delete_notification_old} = require('../controllers/notifyController');

exports.autoruntime = function() {
    cron.schedule('49 3 * * *', function(){
        console.log('running a task every 3 clock 49 minute');
        pawn.delete_all_pawn_trash();
        deletefileinfoldertemps();
        delete_notification_old();
    });

    // cron.schedule('* * * * *', function(){
    //     console.log('running a task every minute');
    //
    // });
}

let deletefileinfoldertemps = () => {
    const testFolder = config.folder_temp;
     fs.readdirSync(testFolder).forEach(file => {
         fsextra.ensureFile(path.join(`${testFolder}`,`${file}`))
             .then(() => {
                 fsextra.removeSync(path.join(`${testFolder}`,`${file}`));
                 console.log(file);
             })
             .catch(err => {
                 console.error(err)
             });

    })
}
