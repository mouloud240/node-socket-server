
export class Middleware {
  constructor() {
    if (Middleware.instance) {
      return Middleware.instance;
    }

    this.middlewares = [];
    Middleware.instance = this;
  }

  use(fn) {
    this.middlewares.push(fn);
  }

  async run(context) {
    for (const middleware of this.middlewares) {
      await middleware(context);
    }
  }
}

