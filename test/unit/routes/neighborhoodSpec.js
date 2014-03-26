"use strict";

var chai = require('chai')
  , sinon = require('sinon')
  , should = chai.should
  ;

describe('UNIT /neighborhoods Route', function() {

  var server;

  before( function() {
    server = { get: sinon.spy(), use: sinon.spy() };
    require('../../../app/models/neighborhood.js');
    require('../../../app/routes/neighborhoods.js')(server);
  });

  var routeConfig
    , routeHandler;

  it('assigns a handler to GET', function() {
    server.get.should.have.been.called;
    routeConfig = server.get.args[0][0];
    routeHandler = server.get.args[0][1];
  });

  it('should invoke the controller: neighborhoods.get', function() {
    routeHandler.should.equal( require('../../../app/controllers/neighborhoods').get );
  });  

  describe('configuration', function() {
    
    it('should route to /neighborhoods', function() {
      routeConfig.url.should.be.equal('/neighborhoods');
    });

    it('should have a swagger configuration', function() {
      routeConfig.swagger.should.exist;
    });
  });

});

