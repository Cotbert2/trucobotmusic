const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

console.log('Cron Jobs started');

setInterval(() => {
    console.log('Cleaning audio folder');
    fs.readdirSync('./audio', (err, files) => {
        if (err) throw err;
        files.forEach(file => {
            fs.unlinkSync(`./audio/${file}`);
        });
    });
    console.log('Audio folder cleaned');
}, process.env.CLEAN_FILE_INTERVAL || 60000);