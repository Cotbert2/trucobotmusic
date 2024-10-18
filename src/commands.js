
const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const TOKEN = process.env.TOKEN;
const CLIEN_ID = process.env.CLIENT_ID;
const rest = new REST({version: '9'}).setToken(TOKEN);


const commands = [
    {
        name: 'connect',
        description : 'Connect to a voice channel'
    },
    {
        name: 'disconnect',
        description : 'Disconnect from a voice channel'
    },
    {
        name: 'play',
        description : 'Play a song',
        options: [{
            name: 'song',
            description: 'The song to play as youtube URL',
            type: 3,
            required: true
        }]
    }, 
    {
        name: 'play-search',
        description: 'Play a song by searching on youtube',
        options: [{
            name: 'song',
            description: 'The song to play',
            type: 3,
            required: true
        }]
    }, {
        name: 'skip',
        description: 'Skip the current song'
    }, 
    {
        name: 'pause',
        description: 'Pause the current song'
    }, 
    {
        name: 'resume',
        description: 'Resume the current song'
    }, 
    {
        name: 'queue',
        description: 'Show the current queue'
    },
    {
        name: 'clear-queue',
        description: 'Clear the current queue'
    }
];



(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationCommands(CLIEN_ID), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
} catch (error) {
    console.error(error);
}
})();