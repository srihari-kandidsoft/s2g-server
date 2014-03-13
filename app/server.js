/*global module:true, require:true, console:true, process:true */

'use strict';

module.exports = function(params) {

  // if process.env.NODE_ENV has not been set, default to development
  var NODE_ENV = params.env || 'default';

  var path = require('path')
    , cluster = require('cluster')
    , config = require('yaml-config')
    , settings = config.readConfig(path.join(__dirname, '../config.yaml'), NODE_ENV)
    , worker = require('./worker')
    , logging = require('./logging');

  function spawnWorker (logger) {

    // create servers
    var server = worker.createServer(logger);

    server.on('error', function(err) {
      logger.error(err);
      server.close();
    });

    // start listening
    var port = params.port || process.env.PORT || settings.server.port || 8000;

    server.listen(port, function () {
      logger.info('%s listening at %s', server.name, server.url);
    });
  }

  function createCluster (logger) {
    
    // Set up cluster and start servers
    if (cluster.isMaster) {
      var numCpus = require('os').cpus().length;

      logger.info('Starting master, pid ' + process.pid + ', spawning ' + numCpus + ' workers');

      // fork workers
      for (var i = 0; i < numCpus; i++) {
        cluster.fork();
      }

      cluster.on('listening', function (worker) {
        logger.info('Worker ' + worker.id + ' started');
      });

      // if a worker dies, respawn
      cluster.on('death', function (worker) {
        logger.warn('Worker ' + worker.id + ' died, restarting...');
        cluster.fork();
      });

      cluster.on('close', function (worker) {
        logger.warn('Worker ' + worker.id + ' closed. Not restarting.');
      });
    } 
    // Worker processes
    else {
      spawnWorker(logger);
    }
  }

  function doRun (cluster) {

    // Set up logging
    var logger = logging.createLogger(settings.logs);

    // In production environment, create a cluster
    if (NODE_ENV === 'production' || Boolean(settings.server.cluster) || cluster ) {
      console.log("creating cluster");
      createCluster(logger);
    }
    else {
      spawnWorker(logger);
    }

  }

  return {
    run: function() {
      doRun();
    }
  };

};
