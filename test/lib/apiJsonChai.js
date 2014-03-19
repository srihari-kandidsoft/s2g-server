"use strict";

var chai = require('chai'),
    expect = chai.expect;

module.exports = function(chai, utils) {
  var Assertion = chai.Assertion;

  Assertion.addProperty('twoLetterStateCode', function() {
    this.assert( this._obj.length === 2,
      'expected #{this} to be a #{exp} letter state code',
      'expected #{this} to not be a #{exp} letter state code',
      2);
  });

  Assertion.addProperty('twoLetterCountryCode', function() {
    this.assert( this._obj.length === 2,
      'expected #{this} to be a #{exp} letter country code',
      'expected #{this} to not be a #{exp} letter country code',
      2);
  });

  Assertion.addProperty('stateJSON', function() {
    var state = this._obj;
    expect(state.short).to.be.a.twoLetterStateCode;
    expect(state.long).to.be.a('string');
  });

  Assertion.addProperty('neighborhoodJSON', function() {
    var neighborhood = this._obj;
    expect(neighborhood).to.be.an('object');
    expect(neighborhood).to.have.property('name').that.is.a('string');
    expect(neighborhood).to.have.property('city').that.is.a('string');
    expect(neighborhood).to.have.property('country').that.is.a.twoLetterCountryCode;
    expect(neighborhood).to.have.property('state').that.is.a.stateJSON;
  });

  Assertion.addMethod('apiResponseJSON', function(code) {
    var response = this._obj;
    expect(response).to.be.an('object');
    expect(response).to.have.property('status');
    if (code) {
      expect(response.status).to.equal(code);
    }
  });

};