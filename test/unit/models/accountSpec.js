'use strict';

require('../../../app/models/account');

var mongoose = require('mongoose')
  , Account = mongoose.model('Account')
  , chai = require('chai')
  , mmock = require('mongoose-mock')
  , proxyquire = require('proxyquire')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , should = chai.should
  ;

chai.use(sinonChai);

describe('UNIT Account Model', function() {

  describe('.hashPassword', function() {
    
    it('returns null if no password is supplied', function() {
      chai.expect( Account.hashPassword() ).to.be.null;
      chai.expect( Account.hashPassword( "" ) ).to.be.null;
      chai.expect( Account.hashPassword( undefined ) ).to.be.null;
      chai.expect( Account.hashPassword( null ) ).to.be.null;
    });

    it('should return a hashed password', function () {
      // Hmac is 40 character long.
      Account.hashPassword('hi').should.have.length(40);
    });

    it('should not hash to the same value given the same input', function () {
      var one = Account.hashPassword('one');
      var anotherOne = Account.hashPassword('one');
      one.should.not.equal( anotherOne );
    });
  });

  describe('.password', function() {
    it('sets and gets the same value', function() {
      var account = new Account();
      account.set('password', 'apsswrd');
      var password = account.password;
      password.should.equal('apsswrd');
    });

    it('sets a hash, and a salt', function () {
      var account = new Account();
      account.set('password', 'hi');
      account.salt.should.exist.and.is.length(40);
      account.passwordHash.should.exist.and.is.length(40);
    });
  });

  describe('.getAccountByAccessToken', function () {
    var Account;

    before(function () {
      proxyquire('../../../app/models/account.js', {
        'mongoose': mmock
      });
      Account = mmock.model('Account');
      Account.find.onCall(0).callsArgWith(1, null, "payload");
    });

    it('should query by email and by token', function (done) {
      Account.getAccountByAccessToken('babar@celesteville.lan', 'atoken', 
        function (err, res) {
          Account.find.should.have.been.called;
          res.should.equal('payload');
          done(); 
        });
    });
  });
});