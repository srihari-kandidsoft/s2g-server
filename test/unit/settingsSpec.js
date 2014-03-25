'use strict';

var chai = require('chai')
  , should = chai.should()
  ;


describe('[unit] settings', function () {
  var settings, oldArgv, oldNODE_ENV;
  beforeEach(function () {
    delete require.cache[require.resolve('../../app/settings')];
    oldArgv = process.argv.slice(0);
    oldNODE_ENV = process.env.NODE_ENV;
  });

  afterEach(function () {
    process.argv = oldArgv;
    if (oldNODE_ENV) {
      process.env.NODE_ENV = oldNODE_ENV;
    } else {
      delete process.env.NODE_ENV;
    }
  });

  it('should expose a config object', function () {
    settings = require('../../app/settings');
    settings.should.have.a.property('config'); 
  });

  it('should detect the environment if supplied as an option: --env', function () {
    process.argv.splice(2, 0, '--env', 'foobar');
    settings = require('../../app/settings');
    settings.environment.should.equal('foobar');
  });

  it('should use the value of NODE_ENV is supplied when no --env available', function () {
    process.argv = process.argv.slice(0,1);
    process.env.NODE_ENV = 'babar';
    settings = require('../../app/settings');
    settings.environment.should.equal('babar');
  });

  it('should default to "default" environement', function() {
    process.argv = process.argv.slice(0,1);
    delete process.env.NODE_ENV;
    settings = require('../../app/settings');
    settings.environment.should.equal('default');
  });

  it('should use the first value of --env if more than one is supplied', function() {
    process.argv.splice(2, 0, '--env', 'celeste');
    process.argv.splice(2, 0, '--env', 'alexandre');
    settings = require('../../app/settings');
    settings.environment.should.equal('alexandre');
  });

});