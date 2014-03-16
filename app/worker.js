/*global module:true, require:true, console:true, process:true */

'use strict';

var path = require('path')
  , restify = require('restify');


exports.createServer = createServer;


/*
 * Set up server
 * @return the created server
 */
function createServer (logger) {

  var config = {
    name: require('../package').name
  };

  if (logger) config.log = logger;

  var server = restify.createServer(config);

  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());

  server.on('NotFound', function (req, res, next) {
    if (logger) logger.debug('404', 'Request for ' + req.url + ' not found. No route.');
    res.send(404, req.url + ' was not found');
  });
  
  if (logger) server.on('after', restify.auditLogger({ log: logger }));
  
  // DEFINE ROUTES
  
  require( './v0/version.js' )(restify, server);

  // sample route
  // USAGE EXAMPLE: /test
  server.get('/test', function (req, res, next) {
    res.send({'result': 'test'});      
    return next();
  });

  return server;
}
