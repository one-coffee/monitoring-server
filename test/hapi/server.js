import { expect, assert } from 'chai';
import { getServerInstance, getPersistenceInstance, getNode, getUser } from './helper';
import winston from 'winston';

describe('Basic rest api server test', () => {
  before(() => winston.remove(winston.transports.Console));

  describe('Boot up', () => {
    it('It should start without exception.', done => {
      getServerInstance().then(() => done());
    });
  });

  describe('Route testing.', () => {
    let hapi;
    let server;
    beforeEach(done => {
      getServerInstance().then(ser => {
        server = ser;
        hapi = ser.server;
        done();
      });
    });

    it('It should fetch index route.', done => {
      hapi.inject({
        method: 'GET',
        url: '/api/'
      }, response => {
        assert.equal(response.statusCode, 200);
        assert.deepEqual(response.result, {api: 'hello!'});
        done();
      });
    });

    it('User should not be able to login with wrong credentials.', done => {
      hapi.inject({
        method: 'POST',
        url: '/api/user/login',
        payload: {
          email: 'test@email.com',
          password: 'ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e413f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff'
        }
      }, response => {
        assert.equal(response.statusCode, 401);
        assert.deepEqual(response.result, {errors: [{status: '401', title: 'Authorization failed.'}]});
        done();
      });
    });

    xit('User should be able to login.', done => {
      hapi.inject({
        method: 'POST',
        url: '/api/user/login',
        payload: {
          email: 'test@email.com',
          password: 'ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff'
        }
      }, response => {
        assert.equal(response.statusCode, 200);
        let returnedUser = response.result;
        server.persistence.getModel('user').findOne({where: {email: 'test@email.com'}}).then(user => {
          assert.equal(returnedUser.id, user.id);
          assert.equal(returnedUser.hash, user.hash);
          done();
        });
      });
    });

    it('Node get one route.', done => {
      getNode(server).then(node => {
        getUser(server).then(user => {
          hapi.inject({
            url: '/api/node/' + node.id,
            credentials: user
          }, response => {
            assert.equal(response.statusCode, 200);
            let returnedNode = response.result;
            assert.equal(returnedNode.id, node.id);
            assert.equal(returnedNode.name, node.name);
            assert.equal(returnedNode.hash, node.hash);
            done();
          });
        });
      });
    });

    it('Node get all route.', done => {
      getUser(server).then(user => {
        hapi.inject({
          url: '/api/node/',
          credentials: user
        }, response => {
          assert.equal(response.statusCode, 200);
          let nodes = response.result;
          server.persistence.getModel('node').findAndCountAll({raw: true}).then(({count}) => {
            assert.isAbove(count, 0, 'No data in tests, maybe broken test?');
            assert.equal(nodes.length, count);
            done();
          });
        });
      });
    });

    it('Node creation route.', done => {
      getUser(server).then(user => {
        hapi.inject({
          method: 'POST',
          url: '/api/node/',
          credentials: user
        }, response => {
          assert.equal(response.statusCode, 200);
          let node = response.result;
          assert.equal(node.user, user.id);
          assert.isString(node.hash);
          assert.isString(node.name);
          done();
        });
      });
    });

    it('Log get all route.', done => {
      getNode(server).then(node => {
        getUser(server).then(user => {
          hapi.inject({
            url: '/api/log/' + node.id,
            credentials: user
          }, response => {
            assert.equal(response.statusCode, 200);
            let logs = response.result;
            server.persistence.getModel('log').findAndCountAll({raw: true}).then(({count}) => {
              assert.isAbove(count, 0, 'No data in tests, maybe broken test?');
              assert.equal(logs.length, count);
              done();
            });
          });
        });
      });
    });

    it('Log creation route.', done => {
      getNode(server).then(node => {
        let log = {severity: 'info', message: 'it should work'};
        hapi.inject({
          method: 'POST',
          url: '/api/log/',
          credentials: node,
          payload: {log: log}
        }, response => {
          assert.equal(response.statusCode, 200);
          let returnedLog = response.result;
          assert.equal(returnedLog.node, node.id);
          assert.equal(returnedLog.severity, log.severity);
          assert.equal(returnedLog.message, log.message);
          assert.equal(returnedLog.context, undefined);
          done();
        });
      });
    });
  });
});
