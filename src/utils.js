const { EmbedBuilder, Embed} = require('discord.js');

const getFileName = (url) => {
    return `./audio/${url.substring(32)}`;
}

const shortName = (name) => {
    if (name.length >= 80) {
        return name.substring(0, 60) + '...';
    }
}

const isYoutubeLink = (url) => {
    const regex = new RegExp('^(https://www.youtube.com/watch\\?v=)');
    return (regex.test(url));
}

const isYoutubeLinkFormMobileDevice = (url) => {
    const regex = new RegExp('^(https://youtu.be/)');
    return (regex.test(url));
}

const prettierMessage = (title, desciption) => {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(desciption)
        .setColor('Blue')
        .setFooter({
            text: 'By: truco-bot ;D'
        })
}

//export function
module.exports = {
    getFileName,
    shortName,
    isYoutubeLink,
    isYoutubeLinkFormMobileDevice,
    prettierMessage
}