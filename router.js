
import { sendResponse } from './utils.js';

/**
 * Represents a single route in the application.
 * Holds the HTTP path, method, route-specific middlewares, and the handler function.
 */
export class Route {
  /**
   * Creates a new Route instance.
   * @param {string} path - The route path.
   * @param {string} method - The HTTP method (GET, POST, etc.).
   * @param {Function} handler - The function to handle matched requests.
   */
  constructor(path, method, handler) {

    if (new.target !== Route){

    throw new Error('Route class is not meant to be instantiated directly. Use Router methods instead.');
    }
      /** @type {string} */
    this.path = path;
    /** @type {string} */
    this.method = method;
    /** @type {Function[]} */
    this.middlwares = [];
    /** @type {Function} */
    this.handler = handler;  }



  /**
   * Adds a middleware function to this route.
   * Middleware functions run before the route handler.
   * @param {(ctx: object, next: Function) => Promise<void>|void} middleware - The middleware function.
   * @returns {Route} The current Route instance (for chaining).
   */
  use(middleware) {
    this.middlwares.push(middleware);
    return this;
  }
}

/**
 * A simple HTTP router that stores routes, handles route matching,
 * and executes global and route-specific middlewares.
 *
 * @example
 * const { router } = require('./router.js');
 * 
 * router.use(async (ctx, next) => {
 *   console.log('Global middleware');
 *   await next();
 * });
 * 
 * router.get('/hello', async (ctx) => {
 *   sendResponse('Hello World', 200, 'text/plain', ctx.socket);
 * });
 */
export class Router {
  /**
   * Creates a new Router instance.
   */
  constructor() {
    /** @type {Route[]} */
    this.routes = [];
    /** @type {Function[]} */
    this.globalMiddlewares = [];
  }

  /**
   * Registers a new route.
   * @param {string} path - The route path.
   * @param {string} method - The HTTP method.
   * @param {Function} handler - The function to handle matched requests.
   * @returns {Route} The created Route instance.
   */
  addRoute(path, method, handler) {
    const route = new Route(path, method, handler);
    this.routes.push(route);
    return route;
  }

  /**
   * Registers a GET route.
   * @param {string} path - The route path.
   * @param {Function} handler - The route handler function.
   * @returns {Route}
   */
  get(path, handler) {
    return this.addRoute(path, 'GET', handler);
  }

  /**
   * Registers a POST route.
   * @param {string} path - The route path.
   * @param {Function} handler - The route handler function.
   * @returns {Route}
   */
  post(path, handler) {
    return this.addRoute(path, 'POST', handler);
  }

  /**
   * Registers a PUT route.
   * @param {string} path - The route path.
   * @param {Function} handler - The route handler function.
   * @returns {Route}
   */
  put(path, handler) {
    return this.addRoute(path, 'PUT', handler);
  }

  /**
   * Registers a DELETE route.
   * @param {string} path - The route path.
   * @param {Function} handler - The route handler function.
   * @returns {Route}
   */
  delete(path, handler) {
    return this.addRoute(path, 'DELETE', handler);
  }

  /**
   * Adds a global middleware function.
   * Global middlewares run before any route-specific middlewares and handlers.
   * @param {(ctx: object, next: Function) => Promise<void>|void} middleware - The middleware function.
   * @returns {Router} The current Router instance (for chaining).
   */
  use(middleware) {
    this.globalMiddlewares.push(middleware);
    return this;
  }

  findRoute(path, method) {
    for (let i=0, len=this.routes.length; i<len; i++) {
      const route = this.routes[i];
      if (route.method===method){
      const pathSegments = path.split('/');  
      const routeSegments = route.path.split('/');
      if (pathSegments.length !== routeSegments.length) {
        continue; // Path length mismatch
      }
        let match= true;
      routeSegments.forEach((segment,index)=>{
        if (segment.startsWith(':')) {
          return;
          // This is a dynamic segment, skip it

        }
        if (segment !== pathSegments[index]) {
          match=false; // Segment mismatch
          return;
        }

      })
        if (match) {
          return route; // Found a matching route
        }

      }
        }
    return null; // No matching route found
  }
  /**
   * Executes the router for a given request context.
   * Matches the route by path and method, applies middlewares, and executes the handler.
   * @param {{ socket: import('net').Socket, data: { path: string, method: string, [key: string]: any } }} ctx - The request context.
   * @returns {Promise<void>}
   */
  async run(ctx) {
    const { socket, data } = ctx;
    const { path, method } = data;


    const route =this.findRoute(path, method); 
    if (route==null) {
      sendResponse(JSON.stringify({ error: 'Route not found', status: 404 }), 404, 'json', socket);
      return;
    }
    // Check the path if it has dynamic segments
    const dynamicSegments= route.path.split('/').filter(segment => segment.startsWith(':'));
    if (dynamicSegments.length > 0) {
      // Extract dynamic parameters from the path
      const pathSegments = path.split('/');
      const routeSegments = route.path.split('/');
      const params = {};
      for (let i = 0; i < routeSegments.length; i++) {
        if (routeSegments[i].startsWith(':')) {
          // This is a dynamic segment, extract the value
          params[routeSegments[i].substring(1)] = pathSegments[i];
        }
      }
      // Add the params to the context
      ctx.data.params=params;
    }

    // Apply global middlewares
    if (this.globalMiddlewares.length > 0) {
      let index = 0;
      const next = async () => {
        if (index < this.globalMiddlewares.length) {
          const middleware = this.globalMiddlewares[index++];
          await middleware(ctx, next);
        }
      };
      await next();
    }

    // Apply route-specific middlewares
    if (route.middlwares.length > 0) {
      let index = 0;
      const next = async () => {
        if (index < route.middlwares.length) {
          const middleware = route.middlwares[index++];
          await middleware(ctx, next);
        } else {
          await route.handler(ctx);
        }
      };
      await next();
    } else {
      await route.handler(ctx);
    }
  }
}

/** @type {Router} */
export const router = new Router();

