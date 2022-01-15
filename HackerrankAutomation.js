//project 
// node HackerrankAutomation.js --url=https://www.hackerrank.com --config=config.json 
//In this project we will do automation, we will go to contests in hackerrank and add a moderator to each of the contests

//npm init -y
//npm nstall minimist
//npm install puppeteer

let minimist = require("minimist");
let puppeteer = require("puppeteer");
let fs = require("fs");
const { cachedDataVersionTag } = require("v8"); //?
const { url } = require("inspector");

let args = minimist(process.argv);

let configJSON = fs.readFileSync(args.config , "utf-8");
let configJSO = JSON.parse(configJSON); //converted json to jso 

async function  run(){
    //starting the browser

    let browser = await puppeteer.launch({
        //to open on full screen code -
        headless: false,  //we want to see chrome 
        args: [
            '--start-maximized'  //helps to open properly on full screen, open screens fully
        ],
        defaultViewport: null //this full screens the content on the pagehelps to open on full screen,including its icon on page
    });

    //get the tabs ( there is only one tab , jispe open hga)
    let pages = await browser.pages(); //getting page
    let page = pages[0];

    //open the url
    await page.goto(args.url);

    //we need to wait , its an imp. step, otheriwse it won't read it 
    //so we have to wait everytime we click so that before clicking it , it can read it

    //wait and then click on login on pag1
    await page.waitForSelector("a[data-event-action='Login']");
    await page.click("a[data-event-action='Login']");
    
    //wait and then click on login page 2
    await page.waitForSelector("a[href='https://www.hackerrank.com/login']")
    await page.click("a[href='https://www.hackerrank.com/login']");

    //type userid
    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']",configJSO.userid,{delay: 50});

    await page.waitFor(3000); //waiting on it so that it can go to next step

    //type password
    await page.waitForSelector("input[name='password']");
    await page.type("input[name='password']",configJSO.password,{delay: 50});

    await page.waitFor(3000); 
    //press click on page 3
    await page.waitForSelector("button[data-analytics='LoginPassword']");
    await page.click("button[data-analytics='LoginPassword']");
     
    //click on compete
    await page.waitForSelector("a[data-analytics='NavBarContests']");
    await page.click("a[data-analytics='NavBarContests']");
    
    //click on manage contests
    await page.waitForSelector("a[href='/administration/contests/']")
    await page.click("a[href='/administration/contests/']");
    
    /*
    //code for only one contest

     //click on first contest
    await page.waitForSelector("p.mmT");
    await page.click("p.mmT");
    await page.waitFor(3000);
    //click on moderators tab
    await page.waitForSelector("li[data-tab='moderators']")
    await page.click("li[data-tab='moderators']")
    //type in moderator
    await page.waitForSelector("input#moderator")
    await page.type("input#moderator", configJSO.moderator,{delay:50});
    await page.keyboard.press("Enter");
    */

    //do from here

    //Number of pages
    await page.waitForSelector("a[data-attr1='Last']");
    let numPages = await page.$eval("a[data-attr1='Last']" , function(atag){  //$eval runs querySelector on that tag which is  "a[data-attr1='Last']" and when recieved the value it will pass it to the callback function
         let totalPages = parseInt(atag.getAttribute("data-page"));
         return totalPages; //it will return total pages back to the function in numPages
    });

    for(let i = 1; i <= numPages; i++){
        await handleAllContestsOfAPage(page , browser);
       
        if( i != numPages){ //last page pe agar nhi hai toh , toh click on next
             await page.waitForSelector("a[data-attr1='Right']");
             await page.click("a[data-attr1='Right']");
        }
    }
} 

async function handleAllContestsOfAPage(page , browser){

    //find all urls of the same page
    await page.waitForSelector("a.backbone.block-center");
    let curls = await page.$$eval("a.backbone.block-center" , function(atags){ //curls = current url , $$eval will run querySelectorAll 
        let urls = [];

        for(let i = 0; i < atags.length; i++){
            let url = atags[i].getAttribute("href");
            urls.push(url);
        }
        return urls; //return back the array(urls) to the function which is filled by above loop in curls
    });

    for(let i = 0; i < curls.length; i++){
        let ctab = await browser.newPage(); // a new page will be open in browser basically a new tab will be open ,naming it as ctab

        await saveModeratorInContest(ctab , args.url + curls[i], configJSO.moderator);

        await ctab.close(); //closing the page
        await page.waitFor(3000); //waiting on the original page
    }
}
async function saveModeratorInContest(ctab , fullCurl , moderator){

     await ctab.bringToFront(); //it will show us the current tab , that is bring it on the front
     await ctab.goto(fullCurl); // open the link passed 
     await ctab.waitFor(3000);
    
    //click on moderators tab
    await ctab.waitForSelector("li[data-tab='moderators']")
    await ctab.click("li[data-tab='moderators']")

    //type in moderator
    await ctab.waitForSelector("input#moderator")
    await ctab.type("input#moderator", moderator,{delay:50});

    //press enter
    await ctab.keyboard.press("Enter");
}
run();