const puppeteer = require ('puppeteer');
const scrapper = require('./scrapper');

//create a Singleton for puppeteer trying to reduce memory consume
let browser;
let page;



const openBrowser = async () => {
    //singleton
    if(browser) return;
    browser = await puppeteer.launch(
        {
            //TODO: change to headless true in production
            headless : true
        });
    page = await browser.newPage();

}


const visitPage = async (url) => {
    await page.goto(url);
    await page.waitForSelector('ytd-video-renderer', { timeout: 5000 });

    const videos = await page.evaluate(() => {
        let videosSeachResult = [];
        const elements = document.querySelectorAll('ytd-video-renderer');

        elements.forEach(element => {
            let video = {
                title: element.querySelector('#video-title').innerText,
                url: element.querySelector('#video-title').href
            }
            videosSeachResult.push(video);
        });
        return videosSeachResult;
    });
    return videos;
}

const execScrapper = async (search) => {
    await openBrowser();
    let infoPage = await visitPage(scrapper.generateQuery(search));
    return infoPage;

}

const closeBrowser = async () => {
    await browser.close();
}


module.exports = {
    openBrowser,
    execScrapper,
    closeBrowser
}