// # Integration tests
'use strict';

// 
// All integration and acceptance can and should run with an 
// in-process service exposing a localhost:port endpoint or an 
// external endpoint supplied as configuration.

// When no configuration is supplied for the test url, localhost is 
// selected and the default or supplied port setting is used. The test 
// suite will attempt to start an in-process server and run the suite 
// against it. Use such a configuration when you are developing the 
// application and want to do continuous testing and integration.

// When a test url is configured, the test suite will run against 
// that endpoint.  Use this configuration to do deployment validation
// and acceptance testing.

var path = require('path')
  , chai = require('chai')
  , should = chai.should()
  , expect = chai.expect
  , request = require('supertest') 
  , conf = require('../../../app/config')
  , logger = require('../../../app/logging').logger
  , api_assertions = require('../../lib/apiJsonChai')
  , utils = require('../../lib/utils')
  , cluster = require('cluster')
  ;

chai.use( api_assertions );

// ## Naming Suites
// 
// Tests needs to be manageable as more and more are added to the code
// base.  The trick is to use a naming scheme that is describes the 
// type of test and the components it covers.
// 
// In this project, we consider two types of tests: UNIT and INTEGRATION.
// UNIT tests establish that a specific component behaves as it is
// intended to.  A unit test has two key characteristic:
//
// 1. It exercices error cases and ensures that all code pathes
//    in the component behaves as expected.
// 2. It has no external dependencies, therefore it can run on the 
//    local machine without any network or required software install.
//
// The second type of test are INTEGRATION tests.  These tests are 
// designed in a way to exercise the external interfaces of the
// application and observe expected outcomes. For these tests to 
// operate, it is expected that external dependent systems are made
// available and configured in a way to support their success.
//
// Integration tests can be ran on _any_ environment without negative
// functional impact to clients or the application.
//
// When describing a test, one should specify it's major type.  It is
// one of INTEGRATION or UNIT.
describe('INTEGRATION Route', function () {

  var url, app;

  before(function (done) {

    // Set 'url' and start app if no testing endpoint provided.
    if ( process.env.TEST_URL ) {
      url = process.env.TEST_URL;
      // let's increase the timeout of this setup
      // to account for possible spin-up cost on the 
      // hosting platform.
      var timeout = 10000;
      this.timeout(timeout);
      // 0 timeout, we want to wake-it up now.
      logger.info('Waking up end-point (%dms): %s', timeout, url);
      utils.wakeUp(url, done, 0);
    } else if ( conf.get('server.cluster') ) {
      logger.fatal('Configuration for server.cluster must be "false" for local integration tests');
      logger.info('Try CLUSTER=false as environment variable');
      // clustered configurations are not supported
      // in local server mode.
      expect(conf.get('server.cluster')).to.be.false;
    } else {
      this.timeout(10000);
      var port = conf.get('server.port');
      url = 'http://localhost:' + port;
      app = utils.createInProcessApplication(url, done);
    }
  });

  after(function(done) {
    if (app) {
      // Shutdown the app
      app.close( done );
    } else {
      done();
    }
  });

  describe( 'GET #/test', function() {
    it('should return the static test response', function (done) {
      request(url)
            .get('/test')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json')
            .expect(200)
            .end(function (err, res) {
              if (err) return done(err);
              var resp = res.body;
              resp.should.be.an('object');
              resp.result.should.equal("test");
              return done();
            });
    });
  });

  describe( 'GET #/version', function() {

    function getVersion() {
      return require('../../../package.json').version;
    }

    it('should return the current version number', function (done) {
      request(url)
            .get('/version')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json')
            .expect(200)
            .end(function (err, res) {
              if (err) return done(err);
              var resp = res.body;
              resp.should.be.an('object');
              resp.version.should.equal( getVersion() );
              return done();
            });
    });
  });

  describe( 'POST #/accounts', function() {

    require('../../../app/models/account');
    var mongoose = require('mongoose');
    var Account = mongoose.model('Account');

    it('should return the route response', function (done) {
      request(url)
      .post('/accounts')
      .query( {email: Math.random() + '@share2give.lan'} )
      .query( {password: 'a wonderful day'})
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);    
        res.body.should.exist.and.be.an.apiResponseJSON('success');
        res.body.should.have.property('data').that.is.an.accountDetailJSON;
        return done();      
      });
    });

    it('400 with email only', function(done) {
      request(url)
        .post('/accounts')
        .query( {email: Math.random() + '@share2give.lan'} )
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(400)
        .end(done);
    });

    it('400 with invalid email string', function(done) {
      request(url)
        .post('/accounts')
        .query( {email: Math.random() + 'share2give-lan'} )
        .query( {password: 'a wonderful day'})
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(400)
        .end(done);
    });

    it('400 with password only', function(done) {
      request(url)
        .post('/accounts')
        .query( {password: 'a wonderful day'})
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(400)
        .end(done);
    });

    it('400 with no arguments', function(done) {
      request(url)
        .post('/accounts')
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(400)
        .end(done); 
    });
    
    after( function() {
      // tidy up and delete the test account.
      Account.remove( {email: /@share2give.lan/i } , function(err) {
        if (err) {
          logger.warn( 'Failed to remove the test accounts: ' + err );
        }
      });
    });
  });

  describe( 'GET #/neighborhoods', function() {
    it('should return the route response', function (done) {
      request(url)
            .get('/neighborhoods')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json')
            .expect(200)
            .end(function (err, res) {
              if (err) return done(err);
              res.body.should.exist.and.be.an.apiResponseJSON('success');
              res.body.should.have.a.property('data').that.is.an('array');
              for (var i = res.body.data.length - 1; i >= 0; i--) {
                res.body.data[i].should.be.a.neighborhoodJSON;
              }
              return done();
            });
    });
  });

  describe('Oauth2 secured APIs', function () {

    var testUser;
    var testPassword = 'iheartpeanuts';

    before( function (done) {
        // Ensure that babar is registered.
      request(url)
        .post('/accounts')
        .query( {email: testUser = Math.random() + '@share2give.lan'} )
        .query( {password: testPassword })
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end(done);      
    });

    describe('POST #/token', function () {

      it('requires basic_auth, grant_type, username and password', function (done) {
        request(url)
          .post('/token')
          .type('form')
          .auth('officialApiClient', 'C0FFEE')
          .type('form')
          .send({
            grant_type: 'password',
            username: testUser,
            password: testPassword,
          })
          .expect(200)
          .end(function (err, res) {
            if (err) done(err);
            res.body.should.exist.and.be.an.oauthAccessTokenResponseJSON; 
            done();
          });
      });
    });

    describe('GET #/user/:username', function () {

      var token;

      before( function (done) {
        request(url)
          .post('/token')
          .type('form')
          .auth('officialApiClient', 'C0FFEE')
          .type('form')
          .send({
            grant_type: 'password',
            username: testUser,
            password: testPassword,
          })
          .expect(200)
          .end(function (err, res) {
            if (err) done(err);
            res.body.should.exist.and.be.an.oauthAccessTokenResponseJSON; 
            token = res.body.access_token;
            done();
          });
      });

      it('should require authentication', function (done) {
        request(url)
          .get('/user/testUser')
          .set('Accept', 'application/json')
          .expect('Content-Type', 'application/json')
          .expect(401)
          .end(done);
      });

      it('should return a 200', function (done) {

        console.log ( token );
        request(url)
          .get('/user/testUser')
          .set('Authorization', 'Bearer ' + token)
          .set('Accept', 'application/json')
          .expect('Content-Type', 'application/json')
          .expect(200)
          .end(done);
      });

    });

  });


});

