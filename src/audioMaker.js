//dependencies
const ytdl = require('youtube-dl-exec');
const utils = require('./utils');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior,  } = require('@discordjs/voice');
const {Client, REST, Routes, GatewayIntentBits, LimitedCollection, ButtonBuilder, EmbedBuilder, ActionRowBuilder, ActionRow, ButtonStyle} = require('discord.js');
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

    return fileName;
}

const playAudioFile = async (connection, path) => {
    const player = createAudioPlayer(
        {
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            }
        }
    );
    const resource = createAudioResource(path);
    player.play(resource);

    connection.subscribe(player);
}

module.exports = {
    downloadFileByYoutubeURL,
    playAudioFile
}


