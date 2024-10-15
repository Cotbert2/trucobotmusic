
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior,  } = require('@discordjs/voice');
const {Client, REST, Routes, GatewayIntentBits, LimitedCollection, ButtonBuilder, EmbedBuilder, ActionRowBuilder, ActionRow, ButtonStyle} = require('discord.js');
const path = require('path');
const dotenv = require('dotenv');

const {
    connect, disconnect, play,
    playSearch, playSongByButtonEvent, pause
    ,resume, queue, greeting, skip,clearQueue
} = require('./response');


//setup dotenv
dotenv.config();

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

    if(interaction.isButton()) playSongByButtonEvent(interaction);


    if (!interaction.isCommand()) return;


    const { commandName } = interaction;

    const actions = {
        'connect': async () => connect(interaction),
        'disconnect': async () => disconnect(interaction),
        'play': async () => play(interaction),
        'play-search': async () => playSearch(interaction),
        'pause' : async () => pause(interaction),
        'resume' : async () => resume(interaction),
        'skip' : async () => skip(interaction),
        'queue' : async () => queue(interaction),
        'clear-queue' : async () => clearQueue(interaction),
    }

    actions[commandName]();
});



module.exports = client;
