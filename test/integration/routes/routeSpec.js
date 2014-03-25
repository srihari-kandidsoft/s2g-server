'use strict';

/* Main Spec file to run the route tests.
 * This one configures and starts a test server then
 * requires all the route.**.js files and runs them.
 */

var util = require('util')
  , path = require('path')
  , fs = require('fs')
  , chai = require('chai')
  , should = chai.should()
  , expect = chai.expect
  , request = require('supertest') 
  , conf = require('../../../app/config')
  , logger = require('../../../app/logging.js')
  , api_assertions = require('../../lib/apiJsonChai.js')
  ;

chai.use( api_assertions );

describe('[integration] Route', function () {

  var url, app;

  before(function (done) {
    url = 'http://localhost:' + conf.get( 'server.port' );
    var server = require('../../../app/server');
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

  after(function(done) {
    app.close( done );
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


});

