const dotenv = require('dotenv');
const fs = require('node:fs');
dotenv.config();

console.log('Cron Jobs started');

setInterval(() => {
    console.log('Cleaning audio folder');
    fs.readdirSync('./audio', (err, files) => {
        if (err) throw err;
        //for each
        for (const file of files) {
            fs.unlinkSync(`./audio/${file}`);
        }
    });
    console.log('Audio folder cleaned');
}, process.env.CLEAN_FILE_INTERVAL || 60000);