// import dotenv from 'dotenv';
// dotenv.config();
// import axios from 'axios';
// axios.default;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// import { createHTTP2Adapter } from 'axios-http2-adapter';
// import http2 from 'http2-wrapper';

// axios.defaults.adapter = createHTTP2Adapter();


// const data = {
//   username: process.env.UN,
//   password: process.env.PW
// }

// const headers = {
//   'Content-Type': 'application/json'
// } 

// const token = async () => {
//   return new Promise((resolve, reject) => {
//     axios.post(`https://172.30.8.91/api/v1/signin`, data, {headers: headers})
//       .catch(e => reject(e))
//       .then(res => {
//         resolve(res.data)
//       })
//   })
// }

import http2 from 'http2';

const token = () => {
  const client = http2.connect('https://172.30.8.91');

  client.on('error', (err) => console.error(err));
  
  // const req = client.request({ ':path': '/api/v1/signin' });
  
  const req = client.request({
    ':path': '/api/v1/signin',
    ':method': 'POST'
  });

  const d = {
    username: process.env.UN,
    password: process.env.PW
  };

  req.write(JSON.stringify(d), 'utf8')

  req.on('response', (headers, flags) => {
    for (const name in headers) {
      console.log(`${name}: ${headers[name]}`);
    }
  });
  
  req.setEncoding('utf8');
  let data = '';
  req.on('data', (chunk) => { data += chunk; });
  req.on('end', () => {
    console.log(`\n${data}`);
    client.close();
  });
  req.end(); 
}



export {
  token
}
