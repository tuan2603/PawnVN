const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const fsextra = require('fs-extra');
const config = require('../config');
const pawn = require('../controllers/pawnController');

exports.autoruntime = function() {
    cron.schedule('* 12 * * *', function(){
        console.log('running a task every 23 clock');
        pawn.delete_all_pawn_trash();
        //fsextra.removeSync(`${config.folder_temp}`);
        deletefileinfoldertemps();
    });

    // cron.schedule('* * * * *', function(){
    //     console.log('running a task every minute');
    //     //pawn.delete_all_pawn_trash();
    //     //fsextra.removeSync(`${config.folder_temp}`);
    //     deletefileinfoldertemps();
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
