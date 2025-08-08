import Logger  from "../logger.js";
import { Middleware } from "../middleware.js";


const inst=new Middleware();

const logger=new Logger('LoggerMiddleware');

inst.use(async (ctx) => {
  
  
  const { http, socket } = ctx;
  const { path, queryParams, protocol, action, headers } = http;


logger.info(`Received request: ${action} ${path} ${protocol}`);
});
