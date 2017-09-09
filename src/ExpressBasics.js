const jsonBody = require('body/json');
const trueTypeOf = require('ezzy-typeof');

/**
 * @typedef {Object} IncomingMessage
 */

/**
 * @typedef {Object} ServerResponse
 */

/**
 * @typedef {Object} HttpBasics
 * @property {IncomingMessage} request The incoming request.
 * @property {ServerResponse} response The server response.
 * @property {Function} next The next route handler.
 * @property {Function} use The shorthand to bind middleware to the handler.
 * @property {Function} body A function that returns a promise to get the body.
 * @property {Function} i18n A shorthand function that uses i18n module to
 * translate multiple strings at once.
 */

/**
 * A class that turns express arguments (req, res, next) into one
 * single object to make it easy to pass around from method to method.
 */
class ExpressBasics {

  /**
   * Constructor.
   * @param {express} express The express instance.
   */
  constructor(express) {
    this.express = express;

    // Expose any properties and methods
    for (let prop in express) {
      if (express.hasOwnProperty(prop) && !this[prop] &&
        trueTypeOf(express[prop], 'function')) {
        this[prop] = (...args) => express[prop].apply(express, args);
      }
    }
  }

  /**
   * The methods that sends references to the express arguments.
   * @param {Function} mainHandler The handler of the route.
   * @returns {function(*=, *=, *=): *}
   * @private
   */
  _handler(mainHandler) {
    return (request, response, next) => mainHandler({
      request,
      response,
      next,
      i18n: (...args) => {
        for (let i = 0; i < args.length; i++) {
          if (Array.isArray(args[i])) {
            args[i] = request.i18n.__(...args[i]);
          } else {
            args[i] = request.i18n.__(args[i]);
          }
        }
        return args.length === 1 ? args[1] : args;
      },
      use: handler => handler(request, response, next),
      body: () => new Promise((resolve, reject) => {
        if (request.method === 'GET' && request.query.body) {
          try {
            return resolve(JSON.parse(request.query.body));
          } catch (e) {
            return reject(e);
          }
        }
        jsonBody(request, response, (e, body) => e ? reject(e) : resolve(body));
      })
    });
  }

  /**
   * Wraps the call to express with a handler that will catch the 3 parameters
   * and concatinate them into one (without modifying them).
   * @param {string} method The express method to use.
   * @param {*} args Any number of arguments.
   * @returns {*}
   * @private
   */
  _wrap(method, args) {
    if (args[0] === null) {
      args = args.slice(1);
    }
    return this.express[method]
      .apply(this.express, args.slice(0, args.length - 1)
        .concat(this._handler(args[args.length - 1])))
  }

  /**
   * Waraps the use method with a custom handler.
   * @param {*} args Any number of arguments.
   * @returns {*}
   */
  use(...args) {
    return this._wrap('use', args);
  }

  /**
   * Waraps the get method with a custom handler.
   * @param {*} args Any number of arguments.
   * @returns {*}
   */
  get (...args) {
    return this._wrap('get', args);
  }

  /**
   * Waraps the post method with a custom handler.
   * @param {*} args Any number of arguments.
   * @returns {*}
   */
  post(...args) {
    return this._wrap('post', args);
  }

  /**
   * Waraps the delete method with a custom handler.
   * @param {*} args Any number of arguments.
   * @returns {*}
   */
  delete(...args) {
    return this._wrap('delete', args);
  }

  /**
   * Forwards arguments to the listen method
   * @param {*} args Any number of arguments
   */
  listen(...args) {
    return this.express.listen.apply(this.express, args);
  }

}

module.exports = ExpressBasics;
