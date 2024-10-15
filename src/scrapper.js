//dependencies

const openUrl = require('openurl');

const URL = 'https://www.youtube.com/results?search_query='




const getTitles = (data) => {
    //regex tp <a tags
    const regex = /<a[^>]+>([^<]+)<\/a>/g;
    const matches = data.match(regex);
    console.log(matches);
}


const generateQuery  = (search) => {
    const keyToSearch = search.replaceAll(' ', "+");
    console.log(`Keys ${keyToSearch}`);
    return (URL + keyToSearch);
}

const fetchPage = async (urlToFind) => {
    const response = await fetch(urlToFind);
    const data = await response.text();
    console.log(data);
    getTitles(data);
}

module.exports = {
    generateQuery,
    fetchPage
}
//openUrl.open(toFind);