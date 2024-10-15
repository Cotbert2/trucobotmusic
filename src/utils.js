
const getFileName = (url) => {
    return `./audio/${url.substring(32)}`;
}

const shortName = (name) => {
    if (name.length >= 80) {
        return name.substring(0, 60) + '...';
    }
}


//export function 
module.exports = {
    getFileName,
    shortName
}