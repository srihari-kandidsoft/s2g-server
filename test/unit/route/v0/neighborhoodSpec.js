"use strict";

// Sample unit test for extensive testing of the route object.
// Mostly useless, but demonstrate how to proxy modules,
// use stubs and spy to the right conditions to trigger 
// error behaviors.

var mongooseMock = require('mongoose-mock')
  , proxyquire = require('proxyquire')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , expect = chai.expect
  , neighborhoodStub = { find: function(){} }
  ;

describe('route /v0/neighborhoods.js', function() {
  var routeBuilder;
  var server;
  var cb;
  var foo = 'hi';

  before(function() {
    routeBuilder = proxyquire('../../../../app/v0/neighborhoods.js', {
      '../model/neighborhood.js': neighborhoodStub
    });
  });

  it('registers a GET callback', function() {
    server = { get: sinon.spy(), use: sinon.spy() };
    var route = routeBuilder(server);
    server.get.should.have.been.called;
    cb = server.get.args[0][1];
  });

  describe('gets data', function() {

    var data_cb;
    var stub = sinon.stub(neighborhoodStub, 'find', function() {
        return {
          exec: function( dcb ) {
            data_cb = dcb;
          }
        };
      });

    var req = {}
      , res = { send: sinon.spy() }
      , next = sinon.spy();

    before( function() {
      cb(req,res,next);
    });
    
    it('invokes the model with a data callback', function() {
      stub.should.have.been.called;
      data_cb.should.exist;
    });

    describe('and builds a successful response', function() {
      it('by creating a json object', function() {
        data_cb( null, "payload");
        res.send.should.have.been.called;
        res.send.args[0][0].should.deep.equal( { status: "success", data: "payload"});
      });

      it('then calls next()', function() {
        next.should.have.been.called;
      });
    });

    describe('and builds an error response', function() {
      it('by creating a json object', function() {
        data_cb( "data error", "payload");
        res.send.should.have.been.called;
        res.send.args[1][0].should.deep.equal( { status: "error", data: "payload", message: "data error"});
      });

      it('then calls next()', function() {
        next.should.have.been.called;
      });
    });

  });



});