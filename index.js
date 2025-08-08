import { parseHttpText, parseUrl, sendResponse } from './utils.js';
import {Middleware} from './middleware.js';
import { createServer } from 'node:net';

import { router, routes } from './routes.js';
import Logger from './logger.js';
import './middlewares/index.js'
import { sendStreamResponse } from './stream.js';
import fs   from 'fs';
const logger=new Logger('server');


const instance = new Middleware();
// Create the server

//Define routes
const route=router.get('/health', async (ctx) => {
  const { socket } = ctx;
 sendResponse(JSON.stringify({ status: 'ok' }), 200, 'json', socket);
});
const server = createServer((socket) => {
  socket.on('data', async (data)=>{
    const http=parseHttpText(data.toString())
    await instance.run({http,socket})
    await router.run({data:http,socket})});
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
