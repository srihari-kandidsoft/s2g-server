"use strict";
var path = require('path');

GLOBAL.appquire = function(module) {
  return require( path.join(__dirname, module) );
};
