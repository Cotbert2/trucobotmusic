//dependencies
const ytdl = require('youtube-dl-exec');
const utils = require('./utils');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus,  } = require('@discordjs/voice');
const {Client, REST, Routes, GatewayIntentBits, LimitedCollection, ButtonBuilder, EmbedBuilder, ActionRowBuilder, ActionRow, ButtonStyle} = require('discord.js');
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
    const fileName =  utils.getFileName(url);
    let videoTitle = '';
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


