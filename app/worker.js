/*global module:true, require:true, console:true, process:true */

'use strict';

var path = require('path')
  , restify = require('restify')
  , mongoose = require('mongoose')
  , settings = require('./settings').config
  , restify = require('restify')
  , restifySwagger = require('node-restify-swagger')
  , restifyValidation = require('node-restify-validation')
  , restifyOAuth2 = require('restify-oauth2')
  , hooks = require('./oauth2Hooks')
  , logger = require('./logging').logger
  ;

exports.createServer = createServer;

/*
 * Set up server
 * @return the created server
 */
function createServer () {

  var config = {
    name: require('../package').name,
    log: logger
  };

  var server = restify.createServer(config);

  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser({ mapParams: false }));
  server.use(restify.authorizationParser());
  console.log(hooks);
  restifyOAuth2.ropc(server, { tokenEndpoint: '/token', hooks: hooks }); 

  restifySwagger.configure(server, {
    info: {
      contact: 'seb@share2give.com',
      description: 'This page allows you to learn about the API and issue sample requests.',
      license: 'Copyright 2014 - Share2Give, all rights reserved.',
      // licenseUrl: 'http://opensource.org/licenses/MIT',
      // termsOfServiceUrl: 'http://opensource.org/licenses/MIT',
      title: 'Welcome to the developer API console.'
    },
    apiDescriptions: {
      'get':'GET-Api Resource',
      'post':'POST-Api Resource'
    }
  });

  server.on('NotFound', function (req, res, next) {
    if (logger) logger.debug('404', 'Request for ' + req.url + ' not found. No route.');
    res.send(404, req.url + ' was not found');
  });
  
  if (logger) {
    server.on('after', restify.auditLogger({ log: logger }));
  }

  // INIT MONGO
  mongoose.connect(settings.mongo.db);
  mongoose.connection.on('error', function(err) {
    logger.error('Mongoose connection error: %s', err);
  });
  mongoose.connection.on('open;', function(err) {
    logger.info('Mongoose connection opened.');
  });

  // LOAD MODELS
  require( './models/account.js');
  require( './models/neighborhood.js');
  
  // DEFINE ROUTES
  require( './routes/version.js' )(server);
  require( './routes/neighborhoods.js' )(server);
  require( './routes/register_user.js' )(server);
  require( './routes/accounts.js' )(server);
  
  restifySwagger.loadRestifyRoutes();

  // sample route
  // USAGE EXAMPLE: /test
  server.get('/test', function (req, res, next) {
    res.send({'result': 'test'});      
    return next();
  });

  /**
   * Serve static swagger resources
   **/
  server.get(/^\/docs\/?.*/, restify.serveStatic({directory: './swagger-ui'}));
  server.get('/', function (req, res, next) {
      res.header('Location', '/docs/index.html');
      res.send(302);
      return next(false);
    }); 
  
  return server;
}
