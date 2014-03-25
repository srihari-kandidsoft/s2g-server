'use strict';

var config = require('yaml-config')
  , path = require('path')
  , minimist = require('minimist')
  ;

exports.test = config.readConfig(path.join(__dirname, '../config.yaml'), 'test');
exports.production = config.readConfig(path.join(__dirname, '../config.yaml'), 'production');
exports.heroku = config.readConfig(path.join(__dirname, '../config.yaml'), 'heroku');
exports.default = config.readConfig(path.join(__dirname, '../config.yaml'), 'default');
exports.development = config.readConfig(path.join(__dirname, '../config.yaml'), 'development');

function getEnvironment () {
  var argv = minimist(process.argv.slice(2));
  var argEnv = argv.env;
  if ( Object.prototype.toString.call(argv.env) === '[object Array]') {
    // if more than one environment specified, use the first one.
    argEnv = argv.env[0];
  }
  return argEnv || process.env.NODE_ENV || 'default';
}

exports.environment = getEnvironment();
exports.config = exports[ getEnvironment() ];
