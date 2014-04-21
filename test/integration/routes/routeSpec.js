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
  , mongoose = require('mongoose')
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

      // INIT MONGO
      mongoose.connect(conf.get('mongo.db'));
      mongoose.connection.on('error', function(err) {
        logger.error('Mongoose connection error: %s', err);
      });
      mongoose.connection.on('open', function(err) {
        logger.info('Mongoose connection opened.');
      });

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
    logger.info( 'MongoDb: %s', conf.get('mongo.db'));
  });

  after(function(done) {
    if (app) {
      // Shutdown the app
      app.close( done );
    } else {
      done();
    }
  });

  // it.only('should return 201 when a document is saved', function (done) {
  //   request(url)
  //     .put('/users/tyler@durden.lan'  )
  //     // .set('Authorization', 'Bearer ' + token)
  //     .set('Accept', 'application/json')
  //     .set('Content-Type', 'application/json')
  //     .send({
  //       firstName: 'Tyler',
  //       lastName: 'Durden',
  //       address: '1537 Paper Street, Bradford DE 19808',
  //       avatar: 'http://www.thedentedhelmet.com/uploads/avatars/avatar14_15.gif'
  //     })
  //     // .expect('Content-Type', 'application/json')
  //     .expect(201)
  //     .end(done);
  // });

  describe( 'CORS', function() {
    describe( 'Access-Control-Allow-Origin', function () {
      it('should be set to the origin header of the request', function (done) {
        request(url)
          .get('/version')
          .set('Origin', '*')
          .expect('Access-Control-Allow-Origin', '*')
          .expect(200, done);
      });
      it('should not include it when no origin is specified', function (done) {
        request(url)
          .get('/version')
          .expect(200)
          .end(function(err,res) {
            if (err) return done(err);
            expect(res.headers['access-control-allow-origin']).to.be.undefined;
            return done();
          });
      });
    });
    describe( 'Pre-flight requests', function () {
      it('should return all expected headers', function (done) { 
        request(url)
          .options('/token')
          .set('Origin', '*')
          .set('Access-Control-Request-Method', 'POST')
          .expect('Access-Control-Allow-Origin', '*')
          .expect('Access-Control-Allow-Methods', 'POST')
          .expect('Access-Control-Max-Age', '3600')
          .expect('Access-Control-Allow-Headers', 'accept, accept-version, content-type, request-id, origin, x-api-version, x-request-id, authorization')
          .expect(200, done);
      });
    });
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
    var Account = mongoose.model('Account');

    it('should create an account with a query string', function (done) {
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

    it('should create an account with a posted JSON body', function (done) {
      request(url)
      .post('/accounts')
      .send( {email: Math.random() + '@share2give.lan'} )
      .send( {password: 'a wonderful day'})
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
      console.log('expecting to delete /@share2give.lan/i');
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
    
    require('../../../app/models/account');
    var mongoose = require('mongoose');
    var Account = mongoose.model('Account');

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

    after( function() {
      // tidy up and delete the test account.
      Account.remove( {email: /@share2give.lan/i } , function(err) {
        if (err) {
          logger.warn( 'Failed to remove the test accounts: ' + err );
        }
      });
    });

    describe('POST #/token', function () {

      require('../../../app/models/oauth2token');
      var mongoose = require('mongoose');
      var Oauth2Token = mongoose.model('Oauth2Token');

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

      after( function() {
        // tidy up and delete the test account.
        Oauth2Token.remove( {email: /@share2give.lan/i } , function(err) {
          if (err) {
            logger.warn( 'Failed to remove the auth tokens for the test accounts: ' + err );
          }
        });
      });

    });  // #/token

    describe('#users service', function () {

      require('../../../app/models/oauth2token');
      var mongoose = require('mongoose');
      var Oauth2Token = mongoose.model('Oauth2Token');

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

      after( function() {
        // tidy up and delete the test account.
        Oauth2Token.remove( {email: /@share2give.lan/i } , function(err) {
          if (err) {
            logger.warn( 'Failed to remove the auth tokens for the test accounts: ' + err );
          }
        });
      });          

      describe('GET #/users/:username who doesn\'t exist', function () {

        it('should require authentication', function (done) {
          request(url)
            .get('/users/testUser')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json')
            .expect(401)
            .end(done);
        });

        it('should return a 404', function (done) {
          request(url)
            .get('/users/testUser')
            .set('Authorization', 'Bearer ' + token)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json')
            .expect(404)
            .end(done);
        });
      }); // GET #/users/:username

      describe('PUT #/users/:username', function() {

        require('../../../app/models/oauth2token');
        require('../../../app/models/user');
        var mongoose = require('mongoose');
        var Oauth2Token = mongoose.model('Oauth2Token');
        var User = mongoose.model('User');

        var token;

        var tylerDurden = {
          firstName: 'Tyler',
          lastName: 'Durden',
          address: '1537 Paper Street, Bradford DE 19808',
          avatar: 'http://www.thedentedhelmet.com/uploads/avatars/avatar14_15.gif'
        };

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

        after( function() {
          // tidy up and delete the test account.
          Oauth2Token.remove( {email: /@share2give.lan/i } , function(err) {
            if (err) {
              logger.warn( 'Failed to remove the auth tokens for the test accounts: ' + err );
            }
          });

          User.remove( {username: /@share2give.lan/i } , function(err) {
            if (err) {
              logger.warn( 'Failed to remove the users created during these tests: ' + err);
            }
          });
        });

        it('should require authentication', function (done) {
          request(url)
            .put('/users/' + testUser)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json')
            .expect(401)
            .end(done);
        });

        it('should only let owning user account update the profile', function(done) {
          request(url)
            .put('/users/wrongUser' + Math.random() )
            .set('Authorization', 'Bearer ' + token)
            .set('Content-Type', 'application/json')
            .send(tylerDurden)
            .expect(401)
            .end(done);
        });

        it('should return 201 when a document is saved', function (done) {
          request(url)
            .put('/users/' + testUser )
            .set('Authorization', 'Bearer ' + token)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .send(tylerDurden)
            .expect(201)
            .end(done);
        });

        it('should allow successive updates', function (done) {
          // first one (should do an updated if previous test was ran.)
          request(url)
            .put('/users/' + testUser )
            .set('Authorization', 'Bearer ' + token)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .send(tylerDurden)
            .expect(201)
            .end( function () {
              // second one.
              request(url)
                .put('/users/' + testUser )
                .set('Authorization', 'Bearer ' + token)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify({
                  firstName: 'Tyler',
                  lastName: 'Durden',
                  address: '1537 Paper Street, Bradford DE 19808',
                  avatar: 'http://www.thedentedhelmet.com/uploads/avatars/avatar14_15.gif'
                }))
                .expect(201)
                .end(done);
            }); 
        });

        describe('GET #/users/:username', function () {

          before(function (done) {
            request(url)
              .put('/users/' + testUser )
              .set('Authorization', 'Bearer ' + token)
              .set('Accept', 'application/json')
              .set('Content-Type', 'application/json')
              .send( tylerDurden)
              .expect(201)
              .end(done);
          });

          it('should return an existing user', function (done) {
            request(url)
              .get('/users/' + testUser )
              .set('Authorization', 'Bearer ' + token)
              .set('Accept', 'application/json')
              .set('Content-Type', 'application/json')
              .expect(200)
              .end(done);  
          });
        });

        describe('GET #/users/:username/items', function () {

          it('should require authentication', function (done) {
            request(url)
              .get('/users/' + testUser + '/items')
              .set('Accept', 'application/json')
              .expect('Content-Type', 'application/json')
              .expect(401)
              .end(done);
          });

          it('should return an empty list when there are no items', function (done) {
            request(url)
              .get('/users/' + testUser + '/items')
              .set('Authorization', 'Bearer ' + token)
              .set('Accept', 'application/json')
              .set('Content-Type', 'application/json')
              .expect(200)
              .end( function (err, res) {
                if (err) done(err);
                res.body.data.should.be.an.array;
                res.body.data.should.have.length(0);
                done();
              });
          });
        }); // GET #/users/:username/items 

        describe('PUT #/users/:username/items', function () {

          require('../../../app/models/item');
          var Item = mongoose.model('Item');
          var id = new mongoose.Types.ObjectId();
          var numberOfAddedItems = 0;
          var punchBowl = {
            name: 'Punch Bowl',
            description: 'A superb punch bowl that will be quench the thirst at your party. Comes with assorted serving ladle',
            picture: 'http://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Punch_Bowl_on_Stand_LACMA_M.91.320.6.jpg/569px-Punch_Bowl_on_Stand_LACMA_M.91.320.6.jpg',       
          };

          after( function() {
            Item.remove( {_id: id}, function(err) {
              if (err) {
                logger.warn( 'Failed to remove the item id=%s created during this test: %s',
                  id, err);
              }
            });
          });

          it('should require authentication', function (done) {
            request(url)
              .put('/users/' + testUser + '/items/1234567890abcdef')
              .set('Accept', 'application/json')
              .send(punchBowl)
              .expect('Content-Type', 'application/json')
              .expect(401)
              .end(done);
          });

          it('should only let owning user account update the profile', function(done) {
            request(url)
              .put('/users/' + testUser + Math.random() + '/items/123' )
              .set('Authorization', 'Bearer ' + token)
              .set('Content-Type', 'application/json')
              .send(punchBowl)
              .expect(401)
              .end(done);
          });

          it('should return 201 when a document is saved', function (done) {
            request(url)
              .put('/users/' + testUser + '/items/' + id )
              .set('Authorization', 'Bearer ' + token)
              .set('Accept', 'application/json')
              .set('Content-Type', 'application/json')
              .send(punchBowl)
              .expect(201)
              .end(done);
            ++numberOfAddedItems;
          });

          it('should allow successive updates', function (done) {
            // first one (should do an updated if previous test was ran.)
            request(url)
              .put('/users/' + testUser + '/items/' + id )
              .set('Authorization', 'Bearer ' + token)
              .set('Accept', 'application/json')
              .set('Content-Type', 'application/json')
              .send(punchBowl)
              .expect(201)
              .end( function () {
                // second one.
                request(url)
                  .put('/users/' + testUser + '/items/' + id )
                  .set('Authorization', 'Bearer ' + token)
                  .set('Accept', 'application/json')
                  .set('Content-Type', 'application/json')
                  .send(punchBowl)
                  .expect(201, done);
              }); 
            numberOfAddedItems += 2;
          });

          describe('GET #/users/:username/items', function () {

            // TODO fix. Very very bad test.
            // this is using the same user, with a bunch
            // of puts with the same product on the same
            // id, so if any other tests change above that
            // adds other items to the user, well, this test
            // may break. 
            before(function (done) {
              request(url)
                .put('/users/' + testUser + '/items/' + id )
                .set('Authorization', 'Bearer ' + token)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(punchBowl)
                .expect(201, done);
            });

            it('should return all items for that user', function (done) {
              request(url)
                .get('/users/' + testUser + '/items')
                .set('Authorization', 'Bearer ' + token)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .expect(200)
                .end( function (err, res) {
                  if (err) done(err);
                  res.body.data.should.be.an.array;
                  res.body.data.should.have.length(1);
                  done();
                });
            });
          }); // GET #/users/:username/items

          describe('GET #/users/:username/items/:id', function () {

            before(function (done) {
              request(url)
                .put('/users/' + testUser + '/items/' + id )
                .set('Authorization', 'Bearer ' + token)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(punchBowl)
                .expect(201)
                .end(done);
            });

            it('should require authentication', function (done) {
              request(url)
                .get('/users/' + testUser + '/items/1234567890abcdef')
                .set('Accept', 'application/json')
                .send(punchBowl)
                .expect('Content-Type', 'application/json')
                .expect(401)
                .end(done);
            });

            it('should return a specific item for that user', function (done) {
              request(url)
                .get('/users/' + testUser + '/items/' + id)
                .set('Authorization', 'Bearer ' + token)
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .expect(200)
                .end( function (err, res) {
                  if (err) done(err);
                  res.body.data.should.be.an.array;
                  res.body.data.should.have.length(1);
                  done();
                });
            });      
          });  // GET #/users/:username/items/:item

        });  // PUT #/users/:username/items

      });  //PUT #/users/:username

    }); // #/users

  });  // OAUTH secured

});  // INTEGRATION

