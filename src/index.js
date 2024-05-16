import {
  getToken, Creds
} from "./config.js";
import axios from 'axios';
import https from 'https';
import puppeteer from 'puppeteer';
import fs from 'fs';

//pull api data
const getData = async (ip, path) => {
  let token = await getToken(ip);
  return new Promise((resolve, reject) => {
    try {
      axios.get(`https://${ip}/api/v1/${path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        httpsAgent: new https.Agent({
          http2: true,
          rejectUnauthorized: false
        }),
      })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error)
        })
    } catch (error) {
      console.error(error.code)
    }
  }) 
}

const getNamesAndIPs = async () => {
  //initialize
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  //login page
  const Login = async () => {
    await page.goto('https://sync.logitech.com/login');
    await page.setViewport({width: 1080, height: 768});
    await page.waitForSelector("#username");
    await page.type("#username", Creds.SyncUN, { delay: 100 });
    await page.waitForSelector("#password");
    await page.type("#password", Creds.SyncPW, { delay: 100 });
    await page.click('button[type="submit"]').then(() => {
      return {
        result: "Logged In"
      };
    });
  };
  const getPageData = async () => {
    //login
    try {
      await Login();
    } catch(e) {console.log(e)}

    //ip dropdown
    let btn = 'button[class="ResetButton-sc-1odl874-0 IconButton__StyledButton-sc-q31i48-1 dnXLqT fawEUo"]';
    await page.waitForSelector(btn).then(() => page.$eval(btn, (e) => e.click()))

    //find all ip's
    let check = `#checkbox_17`;
    await page.waitForSelector(check).then(() => {page.$eval(check, res => res.click())});
    await page.waitForSelector('p[class="Body__Body3-sc-17rsza-2 eTmBik"]');
    const ips = await page.$$eval('p[class="Body__Body3-sc-17rsza-2 eTmBik"]', ips => {
      return ips.map(b => b.innerHTML)
    });
    //this selector will pull name, sync version, status, update channel
    let dataSel = 'div[class="wrappers__EllipsisCell-sc-16ba2bee-7 iJDBII"]';
    await page.waitForSelector(dataSel);
    const rowData = await page.$$eval(dataSel, names => names.map(b => b.innerHTML));
    const names = rowData.filter(a => a.match(/\w+-\d+.*/gi));
    const versions = rowData.filter(a => a.match(/1\.1[12]\.\d\d\d/))

    ips && names ? browser.close() : console.log('error getting ips or names');
  
    let rtn = [];
    for (let i = 0; i < ips.length; i++) {
      rtn[i] = {
        name: names[i],
        ip: ips[i],
        version: versions[i]
      }
    }


    return rtn
  }



  //iterate through devices, use api to pull information
  let systems = await getPageData();
  for (let sys of systems) {
    //look for version 1.12.x
    if (sys.version.match(/1\.12\./)) {
      try {
        console.log(`getting data for ${sys.name}...`);
        let data =  await getData(sys.ip, "peripherals");
        sys.data = data.result;
      } catch (e) {console.log(e)}
    }
  };

  fs.writeFileSync("testData.json", JSON.stringify(systems, null, 2))
  return systems;
};

const main = async () => {
  console.log(await getNamesAndIPs())


}

export {
  main
}
