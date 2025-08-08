import { parseHttpText, parseUrl, sendResponse } from './utils.js';
import { createServer } from 'node:net';
import { sendStreamResponse } from './stream.js';

import { router} from './router.js';
import fs from 'node:fs';
import Logger from './logger.js';
const logger=new Logger('server');

//Define global middlewares 
router.use(async (ctx,next) => { 
  const { data} = ctx;
  const { path, protocol, method} = data;
  if (!(path=='/logs'&& method=='GET')) {
logger.info(`Received request: ${method} ${path} ${protocol}`);
  }
  next();
})

//Define routes

const route=router.get('/health', async (ctx) => {
  const { socket } = ctx;
 sendResponse(JSON.stringify({ status: 'ok' }), 200, 'json', socket);
});
//Attach middlwares to the route
route.use(async (ctx, next) => {
  const { socket } = ctx;
  logger.info('Middleware executed for /health route');
  await next();
});
router.get('/logs', async (ctx) => {
  const { socket } = ctx;
  const stream=fs.createReadStream(logger.logsPath)
  await sendStreamResponse(stream, 200, 'text/plain', socket);
});
router.get('/tasks/:taskId/:userId', async (ctx) => {
  const { socket, data } = ctx;

  const { taskId,userId } = data.params;
  const { name}=data.queryParams;
  sendResponse(JSON.stringify({ taskId,name,userId }), 200, 'json', socket);
});
router.delete('/logs', async (ctx) => {
  const { socket } = ctx;
  try {
    fs.unlinkSync(logger.logsPath);
    sendResponse(JSON.stringify({ status: 'Logs deleted' }), 200, 'json', socket);
  } catch (err) {
    logger.error(`Error deleting logs: ${err.message}`);
    sendResponse(JSON.stringify({ error: 'Failed to delete logs' }), 500, 'json', socket);
  }
});

// Create the server
const server = createServer((socket) => {
  socket.on('data', async (data)=>{
    const http=parseHttpText(data.toString())
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

const PORT =process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.log(`Server listening on port ${PORT}`);
});
