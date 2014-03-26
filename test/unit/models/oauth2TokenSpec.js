'use strict';

require('../../../app/models/oauth2token');

var mongoose = require('mongoose')
  , Oauth2Token = mongoose.model('Oauth2Token')
  , chai = require('chai')
  , mmock = require('mongoose-mock')
  , proxyquire = require('proxyquire')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , should = chai.should
  , expect = chai.expect
  , logger = require('../../../app/logging.js').logger
  ;

chai.use(sinonChai);

describe('UNIT Oauth2Token Model', function() {

  describe('#token', function() {
    
    it('assigns to tokenHash when set', function() {
      var oauthToken = new Oauth2Token();
      oauthToken.token = 'hi';
      var t = oauthToken.tokenHash;
      expect( oauthToken.tokenHash ).to.have.length(40);
      expect( oauthToken.token ).equal('hi');
    });

    it('should not hash to the same value given the same input', function () {
      var one = new Oauth2Token({token: 'hi'});
      var anotherOne = new Oauth2Token({token: 'hi'});
      one.should.not.equal( anotherOne );
    });
  });

});