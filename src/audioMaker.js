//dependencies
const fs = require('fs');
const ytdl = require('youtube-dl-exec');
const utils = require('./utils');

//TODO: Check better options to download audio

//start timer
console.time('download');

const downloadFileByYoutubeURL = async (url) => {
    const fileName =  utils.getFileName(url);
    await ytdl(url, {
        output: fileName,
        extractAudio: true,
        audioFormat: 'mp3',
    }).then(output => {
        console.log(output);
        console.timeEnd('download');
    }).catch(err => {
        console.error(err);
    });

    //return callback
    return fileName;
}

module.exports = downloadFileByYoutubeURL;


