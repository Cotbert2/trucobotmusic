const fetcher = require('./fetcher');
const bot = require('./bot');
const dotenv = require('dotenv');

const fs = require('node:fs');
const path = require('node:path');



dotenv.config();

fetcher.openBrowser();

bot.login(process.env.TOKEN);

//check when script is killed
const deleteAudioFolderContent  = () => {
    const directory = './audio';
    const fileList = fs.readdirSync(directory);
    for (const file of fileList) {
        console.log(`Deleting ${file}`);
        fs.unlinkSync(path.join(directory, file));
    }
}

process.on('exit', () => {
    fetcher.closeBrowser();
    deleteAudioFolderContent();
    console.log('Happy hacking');
});



