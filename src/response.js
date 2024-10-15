const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior,  } = require('@discordjs/voice');
const {Client, REST, Routes, GatewayIntentBits, LimitedCollection, ButtonBuilder, EmbedBuilder, ActionRowBuilder, ActionRow, ButtonStyle} = require('discord.js');
const { execScrapper } = require('./fetcher');
const path = require('path');
const { playAudioFile, downloadFileByYoutubeURL } = require('./audioMaker');

let connection;

const greeting =  async message => {
    if (message.author.bot) return;
    if (message.content == 'hi') message.reply('pulso');
}


const connect = async (interaction) => {
    if(interaction.member.voice.channel) {
        connectToVoiceChannel(interaction);
       interaction.reply('Me he pulso-conectado a tu canal de voz ;)');
   } else {
       interaction.reply('Únete primero a un canal de voz, no seas mamon');
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
       interaction.reply('Me he mewin-desconectado de tu canal de voz ;)');
   } else {
       interaction.reply('Únete primero a un canal de voz, no seas mamon');
   }
}

const play = async (interaction) => {
    interaction.reply('We are checking the song, please wait a moment');

    const url = interaction.options._hoistedOptions[0].value;
    console.log(`URL: ${url}`);

    const playFile = await downloadFileByYoutubeURL(url);
    console.log('path audio file');
    console.log(path.join(__dirname,'/../' + playFile + '.mp3'));
    playAudioFile(connection, path.join(__dirname,'/../' + playFile + '.mp3'));
}

const playSearch = async (interaction) => {
    await interaction.reply('Listo!, buscaré tu canción (˶ᵔ ᵕ ᵔ˶) ');
    const searchResult = await execScrapper(interaction.options._hoistedOptions[0].value);
    console.log('Search result');
    console.log(searchResult);
    //send message without reply
    //NOTE: u can reply only once per interaction, therefore use followUp

    //include the search result in the embed
    const embed = new EmbedBuilder()
        .setTitle('Resultados de tu búsqueda')
        .setDescription('Elige un opción')

    //buttons for the search result

    const options = new ActionRowBuilder()

    searchResult.map((item, index) => {
        if(index > 3) return;
        options.addComponents(
            new ButtonBuilder()
            .setCustomId(item.url)
            .setLabel( (item.title.length > 20) ? item.title : item.title.substring(0, 20))
            .setStyle(ButtonStyle.Primary)
        );
    });

    await interaction.followUp({embeds: [embed] , components: [options]});
}

const playSongByButtonEvent = async (interaction) => {
    //check if user is in a voice channel
    if(!interaction.member.voice.channel)
        return interaction.reply('Únete primero a un canal de voz, no seas mamon');
    //join to the channel
    await connectToVoiceChannel(interaction);
    interaction.reply('Ok! vamos a reproducir tu canción');
    const url = interaction.customId;
    console.log(`URL: ${url}`);
    const playFile = await downloadFileByYoutubeURL(url);
    console.log('path audio file');
    console.log(path.join(__dirname,'/../' + playFile + '.mp3'));
    playAudioFile(connection,path.join(__dirname,'/../' + playFile + '.mp3'));
}

const connectToVoiceChannel = async (interaction) => {
    connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator
    });
}
module.exports = {
    greeting,
    connect,
    disconnect,
    play,
    playSearch,
    playSongByButtonEvent 
}