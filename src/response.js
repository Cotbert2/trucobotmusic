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

let connection;


const greeting =  async message => {
    if (message.author.bot) return;
    if (message.content == 'hi') message.reply(
        {
            embeds: [prettierMessage('Hi pulso!', 'En qué puedo ayudarte?')],
        }
    );
}

//shitpost

const shitpost = async message => {
    if (message.author.bot) return;
    if (message.content == 'eso') message.reply({
        embeds: [prettierMessage('Eso Kariel', 'Cómo puedo ayudarte papu?')],
    });

}


const connect = async (interaction) => {
    if(interaction.member.voice.channel) {
        connectToVoiceChannel(interaction);
       interaction.reply({
        embeds: [prettierMessage('Conectado', 'Me he pulso-conectado a tu canal de voz ;)')],
       });
   } else {
    interaction.reply({
        embeds: [prettierMessage('Error', 'Únete primero a un canal de voz, no seas mamon')],
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
        embeds: [prettierMessage('Desconectado', 'Me he mewin-desconectado de tu canal de voz ;)')],
       });
   } else {
    interaction.reply({
        embeds: [prettierMessage('Error', 'Únete primero a un canal de voz, no seas mamon')],
    })
    }
}

const play = async (interaction) => {
    let url = interaction.options._hoistedOptions[0].value;
    if (!isYoutubeLink(url) && !isYoutubeLinkFormMobileDevice(url)) return interaction.reply({
        embeds: [prettierMessage('Error', 'Por favor ingresa ')],
    });

    interaction.reply({
        embeds: [prettierMessage('Reproductor', 'Estoy procesando tu solicitud, por favor espera un momento 7w7 ')],
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
        embeds: [prettierMessage('Reproductor', 'Listo!, buscaré tu canción (˶ᵔ ᵕ ᵔ˶) ')],
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
            embeds: [prettierMessage('Error', 'Únete primero a un canal de voz, no seas mamón')],
        });
    //join to the channel
    await connectToVoiceChannel(interaction);
    interaction.reply({
        embeds: [prettierMessage('Reproduciendo', 'Ok! vamos a reproducir tu canción')],
    });
    const url = `https://www.youtube.com/watch?v=${interaction.customId}`;
    console.log(`URL: ${url}`);
    const { fileName, videoTitle} = await downloadFileByYoutubeURL(url);
    console.log('path audio file');
    console.log(path.join(__dirname,'/../' + fileName + '.mp3'));
    enQueueSong(videoTitle, connection,path.join(__dirname,'/../' + fileName + '.mp3'));
    interaction.followUp({
        embeds: [prettierMessage('Listo', `He agregado '${videoTitle}' a la cola de reproducción`)]
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
            embeds: [prettierMessage('Error', 'No hay ninguna canción en la cola, no seas imbécil')],
        });
        return;
    }
    player.stop();
    interaction.reply({
        embeds: [prettierMessage('Reproductor', 'Saltando la canción')],
    });
}

const pause = async (interaction) => {
    //check if the player is playing
    if (!player.state.status === AudioPlayerStatus.Playing){
        interaction.reply({
            embeds: [prettierMessage('Error', 'No se está reproduciendo ninguna canción, no seas imbécil')],
        });
        return;
    }
    player.pause();
    interaction.reply({
        embeds: [prettierMessage('Reproductor', 'Pausando la canción')],
    });
}

const resume = async (interaction) => {
    if (!player.state.status === AudioPlayerStatus.Paused){
        interaction.reply({
            embeds: [prettierMessage('Error', 'No hay ninguna canción para reanudar, no seas imbécil')],
        });
        return;
    }
    interaction.reply({
        embeds: [prettierMessage('Reproductor', 'Reanundando la canción')]
    });
    player.unpause();
}

const queue = async (interaction) => {
    if(songsQueue.length === 0) return interaction.reply({
        embeds: [prettierMessage('Cola de Reproducción', 'La cola se encuentra vacía por ahora ( ͡° ͜ʖ ͡°)')]
    });
    let response = '';
    songsQueue.map((song, index) => {
        response += `${index + 1} - ${song.title}\n`;
        console.log(song)
    });
    interaction.reply({
        embeds: [prettierMessage('Cola de Reproducción', response)]
    });
}

const clearQueue = async (interaction) => {
    songsQueue = [];
    interaction.reply({
        embeds: [prettierMessage('Cola de Reproducción', 'Cola de canciones limpiada')]
    });
}



module.exports = {
    greeting,connect, disconnect,
    play,playSearch,pause,
    playSongByButtonEvent,resume,queue,
    clearQueue, skip, shitpost
}