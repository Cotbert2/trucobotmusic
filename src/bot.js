
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior,  } = require('@discordjs/voice');
const {Client, REST, Routes, GatewayIntentBits, LimitedCollection, ButtonBuilder, EmbedBuilder, ActionRowBuilder, ActionRow, ButtonStyle} = require('discord.js');
const path = require('path');
const audioMaker = require('./audioMaker');
const dotenv = require('dotenv');
const fullScrapper = require('./main');

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
        const playFile = await audioMaker(url);
        console.log('path audio file');
        console.log(path.join(__dirname, playFile + '.mp3'));
        playAudioFile(connection, path.join(__dirname, playFile + '.mp3'));

    }


    if (!interaction.isCommand()) return;


    const { commandName } = interaction;

    if (commandName === 'connect') {

        if(interaction.member.voice.channel) {
             connection = joinVoiceChannel({
                channelId: interaction.member.voice.channel.id,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator
            });

            interaction.reply('Me he pulso-conectado a tu canal de voz ;)');
        } else {
            interaction.reply('Únete primero a un canal de voz, no seas mamon');
        }
    } else if (commandName === 'disconnect') {
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
    } else if (commandName === 'play'){

        interaction.reply('We are checking the song, please wait a moment');

        const url = interaction.options._hoistedOptions[0].value;
        console.log(`URL: ${url}`);

        const playFile = await audioMaker(url);
        console.log('path audio file');
        console.log(path.join(__dirname, playFile + '.mp3'));
        playAudioFile(connection, path.join(__dirname, playFile + '.mp3'));

    } else if (commandName === 'play-search') {
        await interaction.reply('Listo!, buscaré tu canción (˶ᵔ ᵕ ᵔ˶) ');
        const searchResult = await fullScrapper.execScrapper(interaction.options._hoistedOptions[0].value);
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
});

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

client.login(TOKEN);


//functions to split