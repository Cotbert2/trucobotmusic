const getFileName = (url) => {
    return `./audio/${url.substring(32)}`;
}

const shortName = (name) => {
    if (name.length >= 80) {
        return name.substring(0, 60) + '...';
    }
}

const isYoutubeLink = (email) => {
    //regex to validate youtube link, therefore begins with https://www.youtube.com/watch?v=
    const regex = new RegExp('^(https://www.youtube.com/watch\\?v=)');
    return regex.test(email);
}

//export function
module.exports = {
    getFileName,
    shortName,
    isYoutubeLink
}