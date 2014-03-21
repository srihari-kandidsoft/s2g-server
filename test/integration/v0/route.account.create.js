'use strict';

var chai = require('chai');
var api_assertions = require('../../lib/apiJsonChai.js');
var expect = chai.expect;
var assert = chai.assert;
var Account = require('../../../app/model/account.js');
var logger = require('../../../app/logging.js');

chai.use( api_assertions );

module.exports = function(request,url) {
  describe( 'POST /v0/accounts', function() {
    it('should return the route response', function (done) {
      request(url)
      .post('/v0/accounts')
      .query( {email: Math.random() + '@share2give.lan'} )
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