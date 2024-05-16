import dotenv from 'dotenv';
dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//axios with http2 adapter mod
import axios from 'axios';
import https from 'https';

const Creds = {
  UN: process.env.UN,
  PW: process.env.PW,
  SyncUN: process.env.SyncUN,
  SyncPW: process.env.SyncPW
}

const getToken = async (ip) => {
  const postData = {
    username: Creds.UN,
    password: Creds.PW
  };
  return new Promise((resolve, reject) => {
    axios.post(`https://${ip}/api/v1/signin`, postData, {
      headers: {
        'Content-Type': 'application/json'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    })
      .then((res) => {
        resolve(res.data.result.auth_token);
      })
      .catch((error) => {
        reject(error)
      })
  }) 
};


export {getToken, Creds}
