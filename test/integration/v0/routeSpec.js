'use strict';

/* Main Spec file to run the route tests.
 * This one configures and starts a test server then
 * requires all the route.**.js files and runs them.
 */

var util = require('util')
  , path = require('path')
  , fs = require('fs')
  , should = require('chai').should()
  // , settings = require('yaml-config').readConfig(path.join(__dirname, '../../..', 'config.yaml'), 'test')
  , settings = require('../../../app/settings').set(process.env.NODE_ENV).get()
  , expect = require('chai').expect
  , request = require('supertest') 
  , url = 'http://localhost:' + settings.server.port;

describe('Route', function () {
  var app;

  before(function (done) {

    var server = require('../../../app/server');
    app = server( {'env': process.env.NODE_ENV } );
    app.run();

    // make sure the server is started
    setTimeout(function() {
      request(url)
          .get('/')
          .expect(404)
          .end(function (err, res) {
            if (err) {
              if (err.code === 'ECONNREFUSED') return done(new Error('Server is not running.'));
              return done(err);
            }
            return done();
          });
    }, 500);
  });

  require('./route.test.js')(request,url);
  require('./route.version.js')(request,url);
  require('./route.neighborhoods.js')(request,url);

  after(function(done) {
    app.close(function() {
      done();
    });
  });

});

