"use strict";

var config = require('yaml-config'); 
var path = require('path');

exports.test = config.readConfig(path.join(__dirname, '../config.yaml'), 'test');
exports.production = config.readConfig(path.join(__dirname, '../config.yaml'), 'production');
exports.heroku = config.readConfig(path.join(__dirname, '../config.yaml'), 'heroku');
exports.default = config.readConfig(path.join(__dirname, '../config.yaml'), 'default');

var current;

exports.set = function (env) {
  current = exports[env];
  return exports;
};

exports.get = function() {
  return current;
};