"use strict";

var mongooseMock = require('mongoose-mock'),
  proxyquire = require('proxyquire'),
  chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('[unit] Neighborhood Model', function() {
  var Neighborhood;

  beforeEach(function() {
    proxyquire('../../../app/model/neighborhood.js',
    { 'mongoose': mongooseMock });
    Neighborhood = mongooseMock.model('Neighborhood');
  }); 

  describe('.createAndSave', function() {
    it('saves the neighborhood', function() {
      var cb = sinon.spy();
      var n = Neighborhood.createAndSave({
        name: 'Mt. Baker',
        city: 'Seattle',
        country: 'US',
        state: {
          short: 'WA',
          long: 'Washington'
        }
      }, cb);
    });
  });
});