'use strict';

/* Main Spec file to run the route tests.
 * This one configures and starts a test server then
 * requires all the route.**.js files and runs them.
 */

var util = require('util')
  , path = require('path')
  , fs = require('fs')
  , should = require('chai').should()
  , expect = require('chai').expect
  , request = require('supertest') 
  ;

describe('[integration] Route', function () {
  var app, oldNODE_ENV, url;

  // Save off current NODE_ENV
  oldNODE_ENV = process.env.NODE_ENV;
  if (!process.env.NODE_ENV) {
    // use 'test' if there was no environement sepecified.
    process.env.NODE_ENV = 'test';
  }

  var settings = require('../../../app/settings').config;

  url = 'http://localhost:' + (process.env.PORT || settings.server.port);
  console.log('is this shit running? : %s', url);

  before(function (done) {

    var server = require('../../../app/server');
    //{'env': process.env.NODE_ENV || 'test' };
    app = server();
    app.run();

    // make sure the server is started
    setTimeout(function() {
      request(url)
          .get('/_not_a_url')
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
  require('./route.account.create.js')(request,url);
  require('./route.neighborhoods.js')(request,url);

  after(function(done) {
    // restore the NODE_ENV
    if (oldNODE_ENV) {
      process.env.NODE_ENV = oldNODE_ENV;
    } else {
      delete process.env.NODE_ENV;
    }

    app.close(function() {
      done();
    });
  });

});

