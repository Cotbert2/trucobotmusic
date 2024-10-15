
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior,  } = require('@discordjs/voice');
const {Client, REST, Routes, GatewayIntentBits, LimitedCollection, ButtonBuilder, EmbedBuilder, ActionRowBuilder, ActionRow, ButtonStyle} = require('discord.js');
const path = require('path');
const dotenv = require('dotenv');
const fullScrapper = require('./fetcher');

const { playAudioFile, downloadFileByYoutubeURL } = require('./audioMaker');

const { connect, disconnect, play, playSearch } = require('./response');

const utils = require('./utils')

//setup dotenv
dotenv.config();

const TOKEN = process.env.TOKEN;
let connection;

const client = new Client(
    { intents :
       [ GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent]
});



client.on('ready', () => {
    console.log('Bot is ready');
    client.user.setPresence({
        activities: [{name: 'Pulso'}],
        status: 'online'
    });
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (message.content == 'hi') message.reply('pulso');
})


client.on('interactionCreate', async interaction => {

    if(interaction.isButton()) {
        //check if user is in a voice channel
        if(!interaction.member.voice.channel) 
            return interaction.reply('Únete primero a un canal de voz, no seas mamon');
        //join to the channel
        interaction.reply('Ok! vamos a reproducir tu canción');
        const url = interaction.customId;
        console.log(`URL: ${url}`);
        const playFile = await downloadFileByYoutubeURL(url);
        console.log('path audio file');
        console.log(path.join(__dirname, playFile + '.mp3'));
        playAudioFile(connection, path.join(__dirname, playFile + '.mp3'));

    }


    if (!interaction.isCommand()) return;


    const { commandName } = interaction;

    const actions = {
        'connect': async () => connect(interaction),
        'disconnect': async () => disconnect(interaction),
        'play': async () => play(interaction),
        'play-search': async () => playSearch(interaction)

    }

    actions[commandName]();
});



module.exports = client;
