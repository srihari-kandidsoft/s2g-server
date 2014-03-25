'use strict';
 /** 
  *  All integration and acceptance can and should run with an 
  *  in-process service exposing a localhost:port endpoint or an 
  *  external endpoint supplied as configuration.
  *
  *  When no configuration is supplied for the test url, localhost is 
  *  selected and the default or supplied port setting is used. The test 
  *  suite will attempt to start an in-process server and run the suite 
  *  against it. Use such a configuration when you are developing the 
  *  application and want to do continuous testing and integration.
  *
  *  When a test url is configured, the test suite will run against 
  *  that endpoint.  Use this configuration to do deployment validation
  *  and acceptance testing.
  */


var path = require('path')
  , chai = require('chai')
  , should = chai.should()
  , request = require('supertest') 
  , conf = require('../../../app/config')
  , logger = require('../../../app/logging').logger
  , api_assertions = require('../../lib/apiJsonChai')
  , utils = require('../../lib/utils')
  ;

chai.use( api_assertions );

/**
 *   This suite will call each route and test
 *   each API indenpendently of the others. 
 *   Start with [integration] tests to ensure 
 *   that APIs are responding the way they should
 *   given no specific use-case.
 *   
 *   For more use-case validation requiring 
 *   more than one API call, look at the 
 *   [acceptance] tests.
 *  
 *   For regressions, look at [regression] 
 *   tests.
 */
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
    } else {
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

  describe( 'GET /test', function() {
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

  describe( 'GET /version', function() {

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

  describe( 'POST /accounts', function() {

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

  describe( 'GET /neighborhoods', function() {
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

  describe('POST /token', function () {
    it('requires basic_auth, grant_type, username and password', function (done) {
      request(url)
        .post('/token')
        .type('form')
        .auth('officialApiClient', 'C0FFEE')
        .type('form')
        .send({
          grant_type: 'password',
          username: 'AzureDiamond',
          password: 'hunter2',
        })
        .expect(200)
        .end(function (err, res) {
          if (err) done(err);
          res.body.should.exist.and.be.an.oauthAccessTokenResponseJSON; 
          done();
        });
    });
  });
});

