'use strict';

var mmock = require('mongoose-mock'),
  proxyquire = require('proxyquire'),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  chai = require('chai'),
  should = chai.should,
  mongoose = require('mongoose'),
  api_assertions = require('../../lib/apiJsonChai.js');

chai.use(sinonChai);

describe('UNIT Oauth2 Controller', function () {
  describe('#validateToken', function () {
    it('calls back with true if the token is valid', function (done) {
      done();
    });

    it('calls back with false if the token is invalide', function (done) {
      done();
    });
  });

  describe('#grantUserToken', function () {
    it('calls back with a token for an authenticated user', function (done) {
      done();
    });
    it('calls back with null for an unknown user', function(done) {
      done();
    });
    it('calls back with null for a bad passowrd', function (done) {
      done();
    });
  });

  describe('#authenticateToken', function () {
    it('calls back with the username if the token exists and is valid', function (done) {
      done();
    });
    it('calls back with null if the token is expired', function (done) {
      done();
    });
    it('calls back with null if the token is not found', function (done) {
      done();
    });
  });
});