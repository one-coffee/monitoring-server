import index from './route/index';
import logCreate from './route/log-create';
import logGetAll from './route/log-get-all';
import logGetAllRest from './route/log-get-all-rest';
import nodeCreate from './route/node-create';
import nodeGetAll from './route/node-get-all';
import nodeGetOne from './route/node-get-one';
import userLogin from './route/user-login';
import userGetOne from './route/user-get-one';

/**
 * @param {internals.Server} server
 * @param {Persistence} persistence
 */
export default function(server, persistence) {
  server.route(index(persistence));
  server.route(logCreate(persistence));
  server.route(logGetAll(persistence));
  server.route(logGetAllRest(persistence));
  server.route(nodeCreate(persistence));
  server.route(nodeGetAll(persistence));
  server.route(nodeGetOne(persistence));
  server.route(userLogin(persistence));
  server.route(userGetOne(persistence));
}
