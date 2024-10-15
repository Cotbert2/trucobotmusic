//dependencies
const URL = 'https://www.youtube.com/results?search_query='

const generateQuery  = (search) => {
    const keyToSearch = search.replaceAll(' ', "+");
    console.log(`Keys ${keyToSearch}`);
    return (URL + keyToSearch);
}

module.exports = {
    generateQuery
}