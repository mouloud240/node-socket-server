import {sendResponse} from './utils.js'
export const routes=['/health','/add','/me','/protected']
export class Route {
  constructor(path, method, handler) {
    this.path = path;
    this.method = method;
    this.middlwares = [];
    this.handler = handler;
  }
  use(middleware) {
    this.middlwares.push(middleware);
    return this;
  }
}
export class Router{
  constructor() {
    this.routes = [];
  }
  
  addRoute(path, method, handler) {
    const route = new Route(path, method, handler);
    this.routes.push(route);
    return route;
  }
  get(path, handler) {
    return this.addRoute(path, 'GET', handler);
  }

  post(path, handler) {
    return this.addRoute(path, 'POST', handler);
  }

  put(path, handler) {
    return this.addRoute(path, 'PUT', handler);
  }

  delete(path, handler) {
    return this.addRoute(path, 'DELETE', handler);
  }
  async run(ctx){
    const {socket,data} = ctx;
    const {path, method} = data; 
    const route = this.routes.find(r => r.path === path && r.method === method);
    if (!route) {
      sendResponse(JSON.stringify({error: 'Route not found',status:404}), 404,'json' ,socket);
      return; 
    }
    if (route.middlwares.length > 0) {
      let index = 0;
      const next =async () => {
        if (index < route.middlwares.length) {
          const middleware = route.middlwares[index++];
          await middleware(ctx, next);
        } else {
          await route.handler(ctx);
        }
      };
      await next();
    }
    else {
      await route.handler(ctx);
    }
  }
}

export const router = new Router();
