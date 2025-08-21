const { joinVoiceChannel,    AudioPlayerStatus} = require('@discordjs/voice');
const {ButtonBuilder, EmbedBuilder, ActionRowBuilder,  ButtonStyle } = require('discord.js');
const { execScrapper } = require('./fetcher');
const path = require('path');

const { isYoutubeLink, isYoutubeLinkFormMobileDevice, prettierMessage , cleanYoutubeURL} = require('./utils');

const {
    player,
    downloadFileByYoutubeURL,
    enQueueSong,
    songsQueue
} = require('./audioMaker');

const { responses_ES } = require( './config/consants/strings_ES');

let connection;


const greeting =  async message => {
    if (message.author.bot) return;
    if (message.content == 'hi') message.reply(
        {
            embeds: [prettierMessage(responses_ES.GREETING_TITLE, responses_ES.GREETING_DESC)],
        }
    );
}

//shitpost

const shitpost = async message => {
    if (message.author.bot) return;
    if (message.content == 'eso') message.reply({
        embeds: [prettierMessage(responses_ES.ESO_TITLE, responses_ES.ESO_DESC)],
    });
}


const connect = async (interaction) => {
    if(interaction.member.voice.channel) {
        connectToVoiceChannel(interaction);
       interaction.reply({
        embeds: [prettierMessage(responses_ES.CONNECTED, responses_ES.CONNECTED_DESC)],
       });
   } else {
    interaction.reply({
        embeds: [prettierMessage(responses_ES.ERROR_TITLE, responses_ES)],
    })
   }
}

const disconnect = async (interaction) => {
    if(interaction.member.voice.channel) {
        connection = joinVoiceChannel({
           channelId: interaction.member.voice.channel.id,
           guildId: interaction.guildId,
           adapterCreator: interaction.guild.voiceAdapterCreator
       });

       connection.destroy();
       interaction.reply({
        embeds: [prettierMessage(responses_ES.DISCONNECTED_TITLE, responses_ES.DISCONNECTED_DESC)],
       });
   } else {
    interaction.reply({
        embeds: [prettierMessage(responses_ES.ERROR_TITLE, responses_ES.NOT_JOINED_CHANNEL)],
    })
    }
}

const play = async (interaction) => {
    let url = interaction.options._hoistedOptions[0].value;
    if (!isYoutubeLink(url) && !isYoutubeLinkFormMobileDevice(url)) return interaction.reply({
        embeds: [prettierMessage(responses_ES.ERROR_TITLE, responses_ES.PLAY_ERROR)],
    });

    interaction.reply({
        embeds: [prettierMessage(responses_ES.PLAYER, responses_ES.PROCESSING)],
    })

    console.log(`URL: ${url}`);
    if(isYoutubeLinkFormMobileDevice(url))
        url = url.replace('https://youtu.be/', 'https://www.youtube.com/watch?v=');

    const { fileName, videoTitle} = await downloadFileByYoutubeURL(url);
    console.log('path audio file');
    console.log(path.join(__dirname,'/../' + fileName + '.mp3'));
    enQueueSong(videoTitle, connection, path.join(__dirname,'/../' + fileName + '.mp3'));
    interaction.followUp(`Listo! he agregado '${videoTitle}' a la cola de reproducción`);
    //playAudioFile( connection, path.join(__dirname,'/../' + playFile + '.mp3'));
}

const playSearch = async (interaction) => {
    await interaction.reply({
        embeds: [prettierMessage(responses_ES.PLAYER, responses_ES.LETS_FIND)],
    });
    const searchResult = await execScrapper(interaction.options._hoistedOptions[0].value);
    console.log('Search result');
    console.log(searchResult);
    //send message without reply
    //NOTE: u can reply only once per interaction, therefore use followUp

    //include the search result in the embed
    const embed = new EmbedBuilder()
        .setTitle('Resultados de tu búsqueda')
        .setDescription('Elige un opción')

    // //buttons for the search result

    const options = new ActionRowBuilder()

    searchResult.map((item, index) => {
        if(index > 3) return;
        options.addComponents(
            new ButtonBuilder()
            .setCustomId(cleanYoutubeURL(item.url))
            .setLabel( (item.title.length <= 50) ? item.title : item.title.substring(0, 20))
            .setStyle(ButtonStyle.Primary)
        );
    });

    await interaction.followUp({embeds: [embed] , components: [options]});
}

const playSongByButtonEvent = async (interaction) => {
    //check if user is in a voice channel
    if(!interaction.member.voice.channel)
        return interaction.reply({
            embeds: [prettierMessage(responses_ES.ERROR_TITLE, responses_ES.NOT_JOINED_CHANNEL)],
        });
    //join to the channel
    await connectToVoiceChannel(interaction);
    interaction.reply({
        embeds: [prettierMessage(responses_ES.PLAYING, responses_ES.LETS_PLAY)],
    });
    const url = `https://www.youtube.com/watch?v=${interaction.customId}`;
    console.log(`URL: ${url}`);
    const { fileName, videoTitle} = await downloadFileByYoutubeURL(url);
    console.log('path audio file');
    console.log(path.join(__dirname,'/../' + fileName + '.mp3'));
    enQueueSong(videoTitle, connection,path.join(__dirname,'/../' + fileName + '.mp3'));
    interaction.followUp({
        embeds: [prettierMessage(responses_ES.READY, `He agregado '${videoTitle}' a la cola de reproducción`)]
    });
}

const connectToVoiceChannel = async (interaction) => {
    connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator
    });
}

const skip = async (interaction) => {
    if(songsQueue.length === 0 && !player.state.status === AudioPlayerStatus.Playing){
        interaction.reply({
            embeds: [prettierMessage(responses_ES.ERROR_TITLE, responses_ES.EMPTY_QUEUE)],
        });
        return;
    }
    player.stop();
    interaction.reply({
        embeds: [prettierMessage(responses_ES.PLAYER, responses_ES.SKIP)],
    });
}

const pause = async (interaction) => {
    //check if the player is playing
    if (!player.state.status === AudioPlayerStatus.Playing){
        interaction.reply({
            embeds: [prettierMessage(responses_ES.ERROR_TITLE, responses_ES.NOT_SONG_PLAYING)],
        });
        return;
    }
    player.pause();
    interaction.reply({
        embeds: [prettierMessage(responses_ES.PLAYER, responses_ES.PAUSE)],
    });
}

const resume = async (interaction) => {
    if (!player.state.status === AudioPlayerStatus.Paused){
        interaction.reply({
            embeds: [prettierMessage(responses_ES.ERROR_TITLE, responses_ES.CANNOT_RESUME)],
        });
        return;
    }
    interaction.reply({
        embeds: [prettierMessage(responses_ES.PLAYER, responses_ES.RESUME)]
    });
    player.unpause();
}

const queue = async (interaction) => {
    if(songsQueue.length === 0) return interaction.reply({
        embeds: [prettierMessage(responses_ES.QUEUE_TITLE, responses_ES.EMPTY_QUEUE_INFO)]
    });
    let response = '';
    songsQueue.map((song, index) => {
        response += `${index + 1} - ${song.title}\n`;
        console.log(song)
    });
    interaction.reply({
        embeds: [prettierMessage(responses_ES.QUEUE_TITLE, response)]
    });
}

const clearQueue = async (interaction) => {
    songsQueue = [];
    interaction.reply({
        embeds: [prettierMessage(responses_ES.QUEUE_TITLE, responses_ES.CLEANED_QUEUE)]
    });
}



module.exports = {
    greeting,connect, disconnect,
    play,playSearch,pause,
    playSongByButtonEvent,resume,queue,
    clearQueue, skip, shitpost
}