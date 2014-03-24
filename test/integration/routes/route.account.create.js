'use strict';

var chai = require('chai');
var api_assertions = require('../../lib/apiJsonChai.js');
var expect = chai.expect;
var assert = chai.assert;
require('../../../app/models/account');
var mongoose = require('mongoose');
var Account = mongoose.model('Account');

var logger = require('../../../app/logging.js');

chai.use( api_assertions );

module.exports = function(request,url) {
  describe( 'POST /routes/accounts', function() {
    it('should return the route response', function (done) {
      request(url)
      .post('/routes/accounts')
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
        .post('/routes/accounts')
        .query( {email: Math.random() + '@share2give.lan'} )
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(400)
        .end(done);
    });

    it('400 with invalid email string', function(done) {
      request(url)
        .post('/routes/accounts')
        .query( {email: Math.random() + 'share2give-lan'} )
        .query( {password: 'a wonderful day'})
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(400)
        .end(done);
    });

    it('400 with password only', function(done) {
      request(url)
        .post('/routes/accounts')
        .query( {password: 'a wonderful day'})
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(400)
        .end(done);
    });

    it('400 with no arguments', function(done) {
      request(url)
        .post('/routes/accounts')
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
};