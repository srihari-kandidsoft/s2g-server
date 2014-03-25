'use strict';
require('newrelic');

var server = require('./app/server.js')
  , app = server();

app.run();