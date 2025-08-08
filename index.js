import { parseHttpText, parseUrl, sendResponse } from './utils.js';
import {Middleware} from './middleware.js';
import { createServer } from 'node:net';

import { routes } from './routes.js';
import Logger from './logger.js';
import './middlewares/index.js'
import { sendStreamResponse } from './stream.js';
import fs   from 'fs';
const logger=new Logger('server');


const instance = new Middleware();
// Create the server

const server = createServer((socket) => {

  socket.on('data', async (data)=>{
    const http=parseHttpText(data.toString())
    const {path,queryParams,protocol,action,headers}=http;

    await instance.run({http,socket})
    if (path === '/logs'){
      const stream= fs.createReadStream('logs.txt', { encoding: 'utf8' });
      await sendStreamResponse(stream,200,'text',socket)
      return 0;
    }
    if (!routes.includes(path)){
      const res={status:404,message:'Route not found'}
sendResponse(JSON.stringify(res),404,'application/json',socket )
      return 0;
    }

     sendResponse(JSON.stringify({test:'hi'}),200,'json',socket) 
    return 0;
  })
  socket.on('lookup', (err, address, family) => {
    if (err) {
      logger.error(`Lookup error: ${err.message}`);
      return;
    }
    logger.info(`Connected to ${address} (${family})`);
  });

  socket.on('end', () => {
    logger.info('Client disconnected');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  logger.log(`Server listening on port ${PORT}`);
});
