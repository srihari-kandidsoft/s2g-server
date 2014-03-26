'use strict';

require('../../../app/models/account');

var mongoose = require('mongoose')
  , chai = require('chai')
  , mmock = require('mongoose-mock')
  , proxyquire = require('proxyquire')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , should = chai.should()
  , expect = chai.expect
  , logger = require('../../../app/logging.js').logger
  ;

chai.use(sinonChai);

describe('UNIT Account Model', function() {

  describe('#password', function() {

    var Account;
    before( function () {
      Account = mongoose.model('Account');
    });

    it('sets and gets the same value', function() {
      var account = new Account();
      account.set('password', 'apsswrd');
      var password = account.password;
      password.should.equal('apsswrd');
    });

    it('sets a hash, and a salt', function () {
      var account = new Account();
      // account.set('password', 'hi');
      account.password = 'hi';
      account.salt.should.exist.and.is.length(32);
      account.passwordHash.should.exist.and.is.length(40);
    });
  });

  describe('#authenticate', function () {
    var Account;

    beforeEach(function (done) {
      proxyquire('../../../app/models/account', {'mongoose':mmock});
      Account = mmock.model('Account');
      done();
    });

    it('fails when the user is not found', function (done) {
      Account.find.onCall(0).callsArgWith(1, null, []);
      Account.authenticate('alexandre@celesteville.lan','thepassword', function (err, res) {
        Account.find.should.have.been.called;
        should.not.exist(res);
        done();
      });
    });

    it('fails when the password is wrong', function (done) {
      var result = [{
        email: 'alexandre@celesteville.lan',
        salt: '123',
        passwordHash: 'cant_hash_to_this'
      }];
      Account.find.onCall(0).callsArgWith(1, null, result);
      Account.authenticate('alexandre@celesteville.lan', 'wrongpassword', function (err, res) {
        Account.find.should.have.been.called;
        should.not.exist(err);
        result[0].should.have.property('email').equal('alexandre@celesteville.lan');
        done();
      });
    });

    it('succeeds when the password matches', function (done) {
      // create a real account so we can get to the hashed password.
      var RealAccount = mongoose.model('Account');
      var realAccount = [ new RealAccount({email: 'isabelle@celesteville.lan', password: 'password'} ) ]; 
      Account.find.onCall(0).callsArgWith(1,null, realAccount );
      Account.authenticate('isabelle@celesteville.lan', 'password', function (err, res) {
        Account.find.should.have.been.called;
        should.not.exist(err);
        res.passwordHash.should.equal(realAccount[0].passwordHash);
        done();
      });
    });
  });

});