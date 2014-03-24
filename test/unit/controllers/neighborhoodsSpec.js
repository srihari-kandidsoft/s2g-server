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

describe('[unit] Neighborhood Controller', function() {

  describe( '.get is Successful', function() {

    var models = [];
    var req, res, next;

    beforeEach( function() { 
      mmock.on('model', function(model) {
        var func = sinon.stub();
        func.onCall(0).callsArgWith(0,null,"some response");
        model.find.returns( { exec: func } );
        models.push( model );
      });
      proxyquire('../../../app/models/neighborhood', {mongoose: mmock});
      var controller = proxyquire('../../../app/controllers/neighborhoods', {mongoose: mmock});

      res = {send: sinon.spy(), status: sinon.spy() };
      next = sinon.spy();

      controller.get(req, res, next);
    });

    afterEach( function() {
      models = [];
      req = res = next = null;
    });

    it('should call find on the model', function () {
      models.should.have.length(1);
    });

    it('should set a response', function() {
      res.send.should.have.been.called;
    });

    it('may have a status set to 200, but nothing else.', function() {
      if (res.status.called) {
        res.status.should.equal(200);
      }
    });

    it('should return an apiResponseJSON', function() {
      res.send.args[0][0].should.exist.and.should.be.an.apiResponseJSON;
    });

    it('should call the next callback in the chain', function() {
      next.should.have.been.called;
    });
  });

  describe('.get encounters an error', function() {
    var models = [];
    var req, res, next;

    beforeEach( function() { 
      mmock.on('model', function(model) {
        var func = sinon.stub();
        func.onCall(0).callsArgWith(0,"this is an error",null);
        model.find.returns( { exec: func } );
        models.push( model );
      });
      proxyquire('../../../app/models/neighborhood', {mongoose: mmock});
      var controller = proxyquire('../../../app/controllers/neighborhoods', {mongoose: mmock});

      res = {send: sinon.spy(), status: sinon.spy() };
      next = sinon.spy();

      controller.get(req, res, next);
    });

    afterEach( function() {
      models = [];
      req = res = next = null;
    });

    it('should set the status code to 400', function() {
      res.status.should.have.been.calledWith(400);
    });

    it('should return an apiResponseJSON', function() {
      res.send.args[0][0].should.exist.and.should.be.an.apiResponseJSON;
    });

    it('should return a status of error', function() {
      res.send.args[0][0].status.should.equal('error');
    });
  });
});