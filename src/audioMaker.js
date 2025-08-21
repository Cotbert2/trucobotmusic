//dependencies
const ytdl = require('youtube-dl-exec');
const utils = require('./utils');
const fs = require('fs');
const { createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus} = require('@discordjs/voice');
const dotenv = require('dotenv');

dotenv.config();
//TODO: Check better options to download audio

//start timer
console.time('download');


let connectionUsage;
let isPlaying = false;
let songsQueue = [];

const enQueueSong = (videoTitle, connection, song) => {
    connectionUsage = connection;
    songsQueue.push(
        {
            song : song,
            title: videoTitle
        });
        console.log('video title' + videoTitle);
    if( songsQueue.length === 1 && !isPlaying) {
        const currentSong = songsQueue.shift();
        playAudioFile(connection, currentSong.song);
    }
}


const player = createAudioPlayer(
    {
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
        }
    }
);

player.on(AudioPlayerStatus.Playing, () => {
    console.log('Audio player is playing!!');
    isPlaying = true;
})



player.on(AudioPlayerStatus.Idle, () => {
    isPlaying = false;
    console.log('Audio player is idle!!');
    if (songsQueue.length > 0) {
        const song = songsQueue.shift();
        playAudioFile(connectionUsage, song.song);
    }
});


const downloadFileByYoutubeURL = async (url) => {
    if(!fs.existsSync(process.env.COOKIES_TXT_FILE_PATH))
        throw new Error('Cookies file not found. Please create a cookies.txt file with your YouTube session cookies.');

    const fileName =  utils.getFileName(url);
    let videoTitle = '';
    await ytdl(url, {
        output: fileName,
        extractAudio: true,
        audioFormat: 'mp3',
        cookies: process.env.COOKIES_TXT_FILE_PATH,
        extractorArgs: 'youtube:player_client=android,web,web_embedded,ios',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',

    }).then(output => {
        console.log(output);
        console.timeEnd('download');
    }).catch(err => {
        console.error(err);
    });

    //get video title
    await ytdl(url, {
        dumpJson: true
    }).then(output => {
        videoTitle = output.title;
    }).catch(err => {
        console.error(err);
    });

    console.log(`Video title: ${videoTitle}`);

    return {
        fileName,
        videoTitle
    };
}


const playAudioFile = async ( connection, path) => {
    console.log(`Queue: ${songsQueue}`);
    console.log(`Playing audio file ${path}`);
    const resource = createAudioResource(path);
    player.play(resource);
    connection.subscribe(player);
}



module.exports = {
    downloadFileByYoutubeURL,
    enQueueSong,
    playAudioFile,
    player,
    songsQueue
}
