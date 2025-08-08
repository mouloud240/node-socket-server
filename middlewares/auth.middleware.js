import Logger  from "../logger.js";
import { Middleware } from "../middleware.js";
import { sendResponse } from "../utils.js";


const inst=new Middleware();

const logger=new Logger('AuthMiddleware');

inst.use(async (ctx) => {
  
  
  const { http, socket } = ctx;
  const { path, queryParams, protocol, action, headers } = http;
   logger.info(headers.Authorization )
  if (path === '/protected') {
     if (!headers.Authorization ){
        logger.error('Unauthorized access attempt');
        const res = { status: 401, message: 'Unauthorized' };
        sendResponse(JSON.stringify(res), 401, 'application/json', socket);
        return;
      }
     }
  
});
